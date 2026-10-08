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
  rabbitmq,
  redis,
  throttle,
} from "./configs";
import { configValidationSchema } from "./config.validation";

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
      validationSchema: configValidationSchema,
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class NestConfigModule {}
