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
  jwtConfigValidationSchema,
  mail,
  mailConfigValidationSchema,
  rabbitmq,
  rabbitmqConfigValidationSchema,
  redis,
  redisConfigValidationSchema,
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
        throttle,
        googleOauth,
        facebookOauth,
      ],
      cache: true,
      isGlobal: true,
      expandVariables: true,
      validationSchema: Joi.object({
        ...appConfigValidationSchema,
        ...jwtConfigValidationSchema,
        ...databaseConfigValidationSchema,
        ...mailConfigValidationSchema,
        ...redisConfigValidationSchema,
        ...cloudinaryConfigValidationSchema,
        ...rabbitmqConfigValidationSchema,
        ...throttleConfigValidationSchema,
        ...googleOauthConfigValidationSchema,
        ...facebookOauthConfigValidationSchema,
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
