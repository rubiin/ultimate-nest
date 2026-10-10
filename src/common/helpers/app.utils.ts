import process from "node:process";

import { IS_PUBLIC_KEY_META, SWAGGER_API_ENDPOINT, swaggerMetadata } from "@common/constant";
import { swaggerOptions } from "@common/swagger/swagger.plugin";
import { INestApplication, ValidationPipeOptions } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { isArray } from "helper-fns";
import { i18nValidationErrorFactory } from "nestjs-i18n";
import { getMiddleware } from "swagger-stats";

import { HelperService } from "./helpers.utils";

const logger = new Logger("App:Utils");

export const AppUtils = {
  async gracefulShutdown(app: INestApplication, code: string) {
    // A second signal while the close is in flight must not start a second one: `app.close()`
    // is not re-entrant and a double close tears down hooks twice.
    if (AppUtils.isShuttingDown) return;

    AppUtils.isShuttingDown = true;

    const forceExit = setTimeout(() => process.exit(1), AppUtils.shutdownTimeoutMs);

    logger.verbose(`Signal received with code ${code} ⚡.`);
    logger.log("❗Closing http server with grace.");

    try {
      await app.close();
      // Cleared on the success path so a healthy shutdown does not leave the timer holding
      // the event loop open.
      clearTimeout(forceExit);
      logger.log("✅ Http server closed.");
      process.exit(0);
    } catch (error: any) {
      logger.error(`❌ Http server closed with error: ${error}`);
      process.exit(1);
    }
  },
  /** Set once a close starts so repeat signals are ignored. */
  isShuttingDown: false,
  killAppWithGrace(app: INestApplication) {
    // The only shutdown path. `app.enableShutdownHooks()` must not be called alongside this:
    // it registers a second SIGINT/SIGTERM pair, so one signal closed the app twice.
    process.on("SIGINT", () => AppUtils.gracefulShutdown(app, "SIGINT"));

    process.on("SIGTERM", () => AppUtils.gracefulShutdown(app, "SIGTERM"));
  },
  setupSwagger(app: INestApplication, configService: ConfigService<Configs, true>) {
    const { username: userName, password: passWord } = configService.get("app.swagger", {
      infer: true,
    });
    const appName = configService.get("app.name", { infer: true });
    const { description, title, version } = swaggerMetadata();

    const options = new DocumentBuilder()
      .setTitle(title)
      .addBearerAuth()
      .setLicense("MIT", "https://opensource.org/licenses/MIT")
      .setDescription(description)
      .setVersion(version)
      .addBearerAuth({ bearerFormat: "JWT", scheme: "bearer", type: "http" }, "accessToken")
      .addBearerAuth({ bearerFormat: "JWT", scheme: "bearer", type: "http" }, "refreshToken")
      .addApiKey({ in: "header", name: "x-api-key", type: "apiKey" }, "apiKey")
      .build();

    const document = SwaggerModule.createDocument(app, options, {});

    const paths = Object.values(document.paths);

    for (const path of paths) {
      const methods = Object.values(path) as { security: string[] }[];

      for (const method of methods) {
        if (isArray(method.security) && method.security.includes(IS_PUBLIC_KEY_META)) {
          method.security = [];
        }
      }
    }

    app.use(
      getMiddleware({
        authentication: true,
        hostname: appName,
        onAuthenticate: (_request: any, username: string, password: string) => {
          return username === userName && password === passWord;
        },
        swaggerSpec: document,
        uriPath: "/stats",
      }),
    );

    SwaggerModule.setup(SWAGGER_API_ENDPOINT, app, document, {
      explorer: true,
      swaggerOptions,
    });
  },
  /** Force-exit budget for a graceful close that never settles. */
  shutdownTimeoutMs: 5000,
  validationPipeOptions(): ValidationPipeOptions {
    return {
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
      // Custom param decorators only read server-side values (the logged-in user entity, headers).
      validateCustomDecorators: false,
      enableDebugMessages: HelperService.isDev(),
      exceptionFactory: i18nValidationErrorFactory,
    };
  },
};
