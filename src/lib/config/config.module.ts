import process from "node:process";
import { HelperService } from "@common/helpers";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import Joi from "joi";
import {
  app,
  appConfigValidationSchema,
  cloudinary,
  cloudinaryConfigValidationSchema,
  database,
  databaseConfigValidationSchema,
  facebookOauth,
  facebookOauthConfigValidationSchema,
  googleOauth,
  googleOauthConfigValidationSchema,
  jwt,
  mail,
  mailConfigValidationSchema,
  rabbitmq,
  rabbitmqConfigValidationSchema,
  redis,
  redisConfigValidationSchema,
  sentry,
  sentryConfigurationValidationSchema,
  throttle,
  throttleConfigValidationSchema,
} from "./configs";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`${process.cwd()}/env/.env.${process.env.NODE_ENV}`],
      load: [
        app,
        jwt,
        database,
        mail,
        redis,
        cloudinary,
        rabbitmq,
        googleOauth,
        facebookOauth,
        throttle,
        sentry,
      ],
      cache: true,
      isGlobal: true,
      expandVariables: true,
      validationSchema: Joi.object({
        ...appConfigValidationSchema,
        ...databaseConfigValidationSchema,
        ...mailConfigValidationSchema,
        ...redisConfigValidationSchema,
        ...cloudinaryConfigValidationSchema,
        ...rabbitmqConfigValidationSchema,
        ...googleOauthConfigValidationSchema,
        ...facebookOauthConfigValidationSchema,
        ...throttleConfigValidationSchema,
        ...sentryConfigurationValidationSchema,
      }),
      validationOptions: {
        abortEarly: true,
        cache: !HelperService.isProd(),
        debug: !HelperService.isProd(),
        stack: !HelperService.isProd(),
      },
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class NestConfigModule {}
