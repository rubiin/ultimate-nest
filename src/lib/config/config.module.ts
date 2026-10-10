import process from "node:process";

import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import {
  app,
  cloudinary,
  database,
  facebookOauth,
  googleOauth,
  jwt,
  mail,
  minio,
  rabbitmq,
  redis,
  sentry,
  storage,
  stripe,
  throttle,
  twilio,
} from "./configs";
import { configValidationSchema } from "./config.validation";

@Module({
  exports: [ConfigService],
  imports: [
    ConfigModule.forRoot({
      cache: true,
      envFilePath: [`${process.cwd()}/env/.env.${process.env.NODE_ENV}`],
      expandVariables: true,
      isGlobal: true,
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
        stripe,
        sentry,
        twilio,
        minio,
        storage,
      ],
      validationSchema: configValidationSchema,
    }),
  ],
  providers: [ConfigService],
})
export class NestConfigModule {}
