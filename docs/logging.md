# Logging with Pino in Nest.js

This module demonstrates how to configure and use nestjs-pino for logging in a Nest.js application. nestjs-pino is a
logger module that provides integration with the Pino logging library in a Nest.js application.

Import the LoggerModule from nestjs-pino in your module file:

```ts

import { Module } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";

@Module({
	imports: [
		LoggerModule.forRootAsync({
			useFactory: () => {
				return {
					// Pino logger options
				};
			},
		}),
	],
	exports: [LoggerModule],
})
export class NestPinoModule {}

```

1. Configure the Pino logger options using the forRootAsync() method. In the provided factory function, you can specify
   various options for the Pino logger, such as name, customProps, serializers, redact, and transport. Here's a
   breakdown of the options used in the given code:
   name: Specifies the name of the logger, which will be used as a prefix in log messages.
   customProps: A function that receives the request and response objects, and can be used to add custom properties to
   the logs. In this example, it adds a context property with the value "HTTP".
   serializers: A mapping of serializers that can be used to customize the serialization of log data. In this example,
   it modifies the req object to include the raw.body property for logging request body.
   redact: An object that specifies fields to be redacted from the logs. In this example, it redacts fields such as
   req.headers.authorization, req.body.password, and req.body.confirmPassword from the logs and replaces them with the
   string "GDPR COMPLIANT".
   transport: Specifies the target transports for logging. In this example, it uses different targets for different
   environments. In production environment, it logs only errors to a file using the pino/file target, and in other
   environments, it logs info and above to console using the pino-pretty target, and errors to a file using the
   pino/file target.
   Import the NestPinoModule in your application's root module or any other module where you want to use logging. For
   example:
2. Import the NestPinoModule in your application's root module or any other module where you want to use logging. For
   example:

```ts
import { Module } from '@nestjs/common';
import { NestPinoModule } from './nest-pino.module';

@Module({
  imports: [NestPinoModule],
})
export class AppModule {}


```

1. You can now use the LoggerService provided by nestjs-pino in your application's components, services, or controllers
   to log messages. For example:

```ts
import { Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MyService {
    private readonly logger = new Logger(MyService.name);

    public doSomething() {
        // Log info level message
        this.logger.log('This is an info level');
// Log error level message
        this.logger.error('This is an error level log message.');

// Log warning level message
        this.logger.warn('This is a warning level log message.');

// Log debug level message
        this.logger.debug('This is a debug level log message.');
    }
}


```

Note: The `LoggerService` provided by `nestjs-pino` is just a wrapper around the Pino logger and provides additional
features such as log context, log levels, and log serialization. You can refer to the
official [Pino documentation](https://github.com/pinojs/pino) for more details on logging with Pino.

Additionally, in the provided code, the redact option is used to specify fields that should be redacted in the logs. The
redactFields array contains paths to the fields that need to be redacted, such as request headers and request body
fields containing sensitive information like authorization tokens or passwords. The censor option is set to "**GDPR
COMPLIANT**" which will replace the values of the redacted fields with this string in the logs.

The transport options are configured based on the environment. In production mode (process.env.NODE_ENV.startsWith("
prod")), logs with the level "error" and above will be written to a file named "app.log" using the pino/file target. The
options for the file target include destination for specifying the log file path, mkdir for creating the log file
directory if it doesn't exist, and sync for writing logs synchronously.

In other environments (not production), logs with the level "info" and above will be logged to the console using the
pino-pretty target, which will provide pretty-printed logs with colors. Logs with the level "error" and above will also
be written to the "app.log" file using the pino/file target with the same options as in production.

Finally, the exclude option is used to exclude logging for specific routes. In this case, logs will be excluded for any
HTTP method and path that matches the "doc" path.

It's important to note that the provided code is just an example and the logging configuration may vary depending on
your specific requirements and use cases. You can refer to the official nestjs-pino documentation for more details on
configuring logging with nestjs-pino.
