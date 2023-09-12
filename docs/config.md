# Nest Config Module

This is a configuration module in a Nest.js application that utilizes the @nestjs/config package for handling
configuration settings. It provides a centralized way to manage various configuration parameters for different parts of
the application, such as app settings, JWT settings, database settings, mail settings, and more.

## Getting Started

To use this module, follow the instructions below:

```ts

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
      }),
      validationOptions: {
        abortEarly: true,
        debug: true,
      },
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class NestConfigModule {}

```

Define your configuration settings in the configs module under `libs/configs/configs`. For example, you can define the
app configuration setting as follows

```ts
export const app = () => ({
  port: parseInt(process.env.APP_PORT) || 3000,
  env: process.env.NODE_ENV || "development",
  // other app configuration parameters
});

export const appConfigValidationSchema = {
  port: Joi.number().default(3000),
  env: Joi.string().valid("development", "production", "test").default("development"),
  // add validation rules for other app configuration parameters
};

```

- app: Configuration for app settings.
- jwt: Configuration for JWT settings.
- database: Configuration for database settings.
- mail: Configuration for mail settings.
- redis: Configuration for Redis settings.
- cloudinary: Configuration for Cloudinary settings.
- rabbitmq: Configuration for RabbitMQ settings.
- googleOauth: Configuration for Google OAuth settings.
- facebookOauth: Configuration for Facebook OAuth settings.
- throttle: Configuration for throttling settings.
- Each configuration setting has its own validation schema and options to customize its behavior.

1. Customize the environment file path and configuration loading behavior in the ConfigModule.forRoot() options. In the
   example code, the environment file path is set to ${process.cwd()}/env/.env.${process.env.NODE_ENV}, which assumes
   that you have environment files in the env directory of your application's root folder.

2. You can also enable caching of configuration values by setting cache option to true in the ConfigModule.forRoot()
   options. This can improve performance by reducing the need to re-parse configuration files on each request.

3. The validationSchema option in the ConfigModule.forRoot() options allows you to define validation schemas for your
   configuration settings using Joi, a popular validation library for JavaScript. You can define validation rules for
   each configuration setting in the configs module, as shown in the example code.

4. The validationOptions option in the ConfigModule.forRoot() options allows you to customize the validation behavior.
   In the example code, abortEarly is set to true to stop validation on the first error, and debug is set to true to
   enable debug information in validation errors.

5. You can use the ConfigService provided by the NestConfigModule to access the configuration settings in your
   application's services, controllers, or other modules. The get() method of the ConfigService allows you to retrieve
   the value of a configuration setting by its key, as shown in the example code.

6. If you need to use the configuration settings in other modules, you can simply import the ConfigModule and inject the
   ConfigService in the constructor of the respective modules.

```ts
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class DatabaseService {
  constructor(private configService: ConfigService<Configs, true>) {}

  getDatabaseUrl(): string {
    return this.configService.get("database.url");
  }

  // ... other methods to access configuration settings related to database
}


```

Update the configuration settings in the configs module or the environment files as needed to reflect changes in your
application's requirements.

That's it! You have now successfully set up and used the NestConfigModule to manage your application's configuration
settings in a centralized and flexible way. Make sure to update the configuration settings accordingly as your
application evolves or when deploying to different environments.
