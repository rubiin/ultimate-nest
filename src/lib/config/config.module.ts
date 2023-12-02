import process from "node:process";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import Joi from "joi";
import { HelperService } from "@common/helpers";
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
  stripe,
  stripeonfigValidationSchema,
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
        stripe,
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
        ...stripeonfigValidationSchema,
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
