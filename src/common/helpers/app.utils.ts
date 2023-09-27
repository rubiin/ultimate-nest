/* eslint-disable unicorn/no-process-exit */
import type { INestApplication, ValidationPipeOptions } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { i18nValidationErrorFactory } from "nestjs-i18n";
import { getMiddleware } from "swagger-stats";
import { isArray } from "helper-fns";

import { swaggerOptions } from "@common/swagger/swagger.plugin";
import {
  IS_PUBLIC_KEY_META,
  SWAGGER_API_CURRENT_VERSION,
  SWAGGER_API_ENDPOINT,
  SWAGGER_DESCRIPTION,
  SWAGGER_TITLE,
} from "@common/constant";
import { HelperService } from "./helpers.utils";

const logger = new Logger("App:Utils");

export const AppUtils = {
  validationPipeOptions(): ValidationPipeOptions {
    return {
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
      enableDebugMessages: HelperService.isDev(),
      exceptionFactory: i18nValidationErrorFactory,
    };
  },

  gracefulShutdown(app: INestApplication, code: string): void {
    setTimeout(() => process.exit(1), 5000);
    logger.verbose(`Signal received with code ${code} ⚡.`);
    logger.log("❗Closing http server with grace.");
    app.close().then(() => {
      logger.log("✅ Http server closed.");
      process.exit(0);
    })
      .catch((error) => {
        logger.error(`❌ Http server closed with error: ${error}`);
        process.exit(1);
      });
  },

  killAppWithGrace(app: INestApplication): void {
    process.on("SIGINT", () => {
      AppUtils.gracefulShutdown(app, "SIGINT");
    });

    process.on("SIGTERM", () => {
      AppUtils.gracefulShutdown(app, "SIGTERM");
    });
  },

  setupSwagger(app: INestApplication, configService: ConfigService<Configs, true>): void {
    const userName = configService.get("app.swaggerUser", { infer: true });
    const passWord = configService.get("app.swaggerPass", { infer: true });
    const appName = configService.get("app.name", { infer: true });

    const options = new DocumentBuilder()
      .setTitle(SWAGGER_TITLE)
      .addBearerAuth()
      .setLicense("MIT", "https://opensource.org/licenses/MIT")
      .setDescription(SWAGGER_DESCRIPTION)
      .setVersion(SWAGGER_API_CURRENT_VERSION)
      .addBearerAuth({
        type: "http",
        scheme: "Bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
      })
      .build();

    const document = SwaggerModule.createDocument(app, options, {});

    const paths = Object.values((document).paths);

    for (const path of paths) {
      const methods = Object.values(path);

      for (const method of methods) {
        if (
          isArray(method.security)
          // eslint-disable-next-line ts/no-unsafe-call
          && method.security.includes(IS_PUBLIC_KEY_META)
        )
          method.security = [];
      }
    }

    app.use(
      getMiddleware({
        swaggerSpec: document,
        authentication: true,
        hostname: appName,
        uriPath: "/stats",
        onAuthenticate: (_request: any, username: string, password: string) => {
          return username === userName && password === passWord;
        },
      }),
    );

    SwaggerModule.setup(SWAGGER_API_ENDPOINT, app, document, {
      explorer: true,
      swaggerOptions,
    });
  },
};
