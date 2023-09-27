import "@total-typescript/ts-reset";

import bodyParser from "body-parser";
import chalk from "chalk";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { ExpressAdapter } from "@nestjs/platform-express";
import { useContainer } from "class-validator";
import compression from "compression";
import helmet from "helmet";
import { I18nValidationExceptionFilter } from "nestjs-i18n";
import { LoggerErrorInterceptor } from "nestjs-pino";
import { createLogger } from "@lib/pino/app.logger";
import { AppUtils, HelperService } from "@common/helpers";
import { SocketIOAdapter } from "./socket-io.adapter";
import { AppModule } from "./app.module";

declare const module: { hot: { accept: () => void; dispose: (argument: () => Promise<void>) => void } };

const logger = new Logger("Bootstrap");

const bootstrap = async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, new ExpressAdapter(), {
    logger: await createLogger(),
    snapshot: true,
  });

  const configService = app.get(ConfigService<Configs, true>);

  // =========================================================
  // configure swagger
  // =========================================================

  if (!HelperService.isProd())
    AppUtils.setupSwagger(app, configService);

  // ======================================================
  // security and middlewares
  // ======================================================

  app.enable("trust proxy");
  app.set("etag", "strong");
  app.use(
    bodyParser.json({ limit: "10mb" }),
    bodyParser.urlencoded({ limit: "10mb", extended: true }),
  );

  if (!HelperService.isProd()) {
    app.use(compression());
    app.use(helmet());
    app.enableCors({
      credentials: true,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
      maxAge: 3600,
      origin: configService.get("app.allowedOrigins", { infer: true }),
    });
  }

  // =====================================================
  // configure global pipes, filters, interceptors
  // =====================================================

  const globalPrefix = configService.get("app.prefix", { infer: true });

  app.useGlobalPipes(new ValidationPipe(AppUtils.validationPipeOptions()));

  app.useGlobalFilters(new I18nValidationExceptionFilter({ detailedErrors: false }));

  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  app.setGlobalPrefix(globalPrefix);

  // =========================================================
  // configure socket
  // =========================================================

  const redisIoAdapter = new SocketIOAdapter(app, configService);

  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  // =========================================================
  // configure shutdown hooks
  // =========================================================

  app.enableShutdownHooks();

  AppUtils.killAppWithGrace(app);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  const port = process.env.PORT ?? configService.get("app.port", { infer: true });

  await app.listen(port);

  logger.log(
        `🚀 Application is running on: ${chalk.green(`http://localhost:${port}/${globalPrefix}`)}`,
  );
  logger.log(
        `🚦 Accepting request only from: ${chalk.green(
            `${configService.get("app.allowedOrigins", { infer: true }).toString()}`,
        )}`,
  );

  !HelperService.isProd()
    && logger.log(`📑 Swagger is running on: ${chalk.green(`http://localhost:${port}/doc`)}`);
  logger.log(`Server is up. ${chalk.yellow(`+${Math.trunc(performance.now())}ms`)}`);
};

(async () => await bootstrap())().catch((error) => {
  logger.error(error);
});
