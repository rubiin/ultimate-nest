import process from "node:process";

import { OptimisticLockFilter, QueryFailedFilter } from "@common/filters";
import { AppUtils, HelperService } from "@common/helpers";
import { InternalDisabledLogger } from "@lib/pino/internal.logger";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ExpressAdapter } from "@nestjs/platform-express";
import chalk from "chalk";
import { useContainer } from "class-validator";
import compression from "compression";
import { I18nValidationExceptionFilter } from "nestjs-i18n";
import { LoggerErrorInterceptor } from "nestjs-pino";

import { AppModule } from "./modules/app.module";
import { SocketIOAdapter } from "./socket-io.adapter";
import "@total-typescript/ts-reset";

declare const module: {
  hot: { accept: () => void; dispose: (argument: () => Promise<void>) => void };
};

const logger = new Logger("Bootstrap");

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),

    {
      snapshot: true,
      logger: new InternalDisabledLogger(),
      // Own parsers are registered below with an explicit limit.
      bodyParser: false,
      routeConflictPolicy: { duplicate: "warn", shadow: "warn" },
      routeResolutionStrategy: "specificity",
    },
  );

  app.set("query parser", "extended");

  // `InternalDisabledLogger` is only the bootstrap logger; without this, every service
  // `Logger.log` kept writing to stdout while requests went to the Pino files.
  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService<Configs, true>);

  // =========================================================
  // configure swagger
  // =========================================================

  if (!HelperService.isProd()) AppUtils.setupSwagger(app, configService);

  // ======================================================
  // security and middlewares
  // ======================================================

  // Trusting every hop makes `request.ips[0]` attacker-controlled, and the throttler keys
  // on it. 0 means "no proxy in front", so the socket address is used.
  app.set("trust proxy", configService.get("app.trustProxyHops", { infer: true }));
  // `weak` revalidates with a stat/mtime instead of hashing every response body.
  app.set("etag", "weak");
  const maxBodySize = configService.get("app.maxBodySize", { infer: true });

  app.useBodyParser("json", { limit: maxBodySize });
  app.useBodyParser("urlencoded", { limit: maxBodySize, extended: true });

  if (!HelperService.isProd()) {
    app.use(compression());
    app.useSecurityHeaders();
    const allowedOrigins = configService.get("app.allowedOrigins", { infer: true }) ?? [];

    app.enableCors({
      credentials: true,
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
      maxAge: 3600,
      // An unset list blocks cross-origin rather than falling back to "*", which
      // `credentials: true` forbids anyway.
      origin: allowedOrigins,
    });
  }

  // =====================================================
  // configure global pipes, filters, interceptors
  // =====================================================

  const globalPrefix = configService.get("app.prefix", { infer: true });

  app.setGlobalPrefix(globalPrefix);

  app.useGlobalPipes(new ValidationPipe(AppUtils.validationPipeOptions()));

  app.useGlobalFilters(
    new I18nValidationExceptionFilter({ detailedErrors: false }),
    new QueryFailedFilter(),
    new OptimisticLockFilter(),
  );

  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  // =========================================================
  // configure socket
  // =========================================================

  const redisIoAdapter = new SocketIOAdapter(app, configService);

  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  // =========================================================
  // configure shutdown hooks
  // =========================================================

  // `AppUtils.killAppWithGrace` owns the signal handling. Enabling Nest's hooks as well
  // would register a second listener pair and close the app twice per signal.
  AppUtils.killAppWithGrace(app);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  if (module?.hot) {
    module.hot.accept();
    module.hot.dispose(async () => app.close());
  }

  const port = process.env.PORT ?? configService.get("app.port", { infer: true })!;

  await app.listen(port);

  const appUrl = `http://localhost:${port}/${globalPrefix}`;

  logger.log(`==========================================================`);
  logger.log(`🚀 Application is running on: ${chalk.green(appUrl)}`);

  logger.log(`==========================================================`);
  logger.log(
    `🚦 Accepting request only from: ${chalk.green(
      `${configService.get("app.allowedOrigins", { infer: true })?.join(", ") || "no origins"}`,
    )}`,
  );

  if (!HelperService.isProd()) {
    const swaggerUrl = `http://localhost:${port}/doc`;
    logger.log(`==========================================================`);
    logger.log(`📑 Swagger is running on: ${chalk.green(swaggerUrl)}`);
  }
}

// `.catch()` rather than `try/catch` around an un-awaited IIFE, which lets the rejection escape.
bootstrap().catch((error) => {
  logger.error(error);
  process.exit(1);
});
