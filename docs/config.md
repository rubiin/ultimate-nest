# Nest Config Module

This is a configuration module in a Nest.js application that utilizes the @nestjs/config package for handling
configuration settings. It provides a centralized way to manage various configuration parameters for different parts of
the application, such as app settings, JWT settings, database settings, mail settings, and more.

## Getting Started

To use this module, follow the instructions below:

```ts
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
        googleOauth,
        facebookOauth,
        throttle,
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
```

Define your configuration settings in the configs module under `libs/configs/configs`. For example, you can define the
app configuration setting as follows

```ts
export const app = () => ({
  port: parseInt(process.env.APP_PORT) || 3000,
  env: process.env.NODE_ENV || "development",
  // other app configuration parameters
});

export const appConfigValidationSchema = z.object({
  APP_PORT: envPort(),
  NODE_ENV: oneOf(APP_ENVIRONMENTS),
  // add validation rules for other app configuration parameters
});
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

3. The validationSchema option in the ConfigModule.forRoot() options accepts any [Standard Schema](https://standardschema.dev/),
   so this project uses [Zod](https://zod.dev/). Each config in the configs module exports its own `z.object(...)`, and
   `config.validation.ts` merges them with `.extend()`. `.extend()` keeps the refinements of the schema it is called on
   and drops the ones of the shape being merged in, which is why `mailConfigValidationSchema` — the only schema with a
   cross-field refinement — is the base of the chain.

4. Env vars always arrive as strings, so `configs/schema.helpers.ts` provides `envNumber()` and `envPort()` to coerce
   them, and `oneOf()` to build a `z.enum()` from the shared string constants. Zod reports every issue at once, so a
   missing value shows up next to all the other failures instead of one at a time.

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
