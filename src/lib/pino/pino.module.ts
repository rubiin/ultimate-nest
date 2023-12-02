import { Module, RequestMethod } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";

// Fields to redact from logs
const redactFields = ["req.headers.authorization", "req.body.password", "req.body.confirmPassword"];
const basePinoOptions = {
  translateTime: true,
  ignore: "pid,hostname",
  singleLine: true,
  redact: redactFields,
};

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (_configService: ConfigService<Configs, true>) => ({
        pinoHttp: {
          timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
          name: "ultimate-nest",
          customProps: (_request, _response) => ({
            context: "HTTP",
          }),
          serializers: {
            req(request: {
              body: Record<string, any>
              raw: {
                body: Record<string, any>
              }
            }) {
              request.body = request.raw.body;

              return request;
            },
          },
          redact: {
            paths: redactFields,
            censor: "**GDPR COMPLIANT**",
          },
          transport: true
            ? {
                targets: [
                  {
                    target: "pino/file",
                    level: "info", // log only errors to file
                    options: {
                      ...basePinoOptions,
                      destination: "logs/info.log",
                      mkdir: true,
                      sync: false,
                    },
                  },
                  {
                    target: "pino/file",
                    level: "error", // log only errors to file
                    options: {
                      ...basePinoOptions,
                      destination: "logs/error.log",
                      mkdir: true,
                      sync: false,
                    },
                  },
                ],
              }
            : {
                targets: [
                  {
                    target: "pino-pretty",
                    level: "info", // log only info and above to console
                    options: {
                      ...basePinoOptions,
                      colorize: true,
                    },
                  },
                  {
                    target: "pino/file",
                    level: "info", // log only errors to file
                    options: {
                      ...basePinoOptions,
                      destination: "logs/info.log",
                      mkdir: true,
                      sync: false,
                    },
                  },
                  {
                    target: "pino/file",
                    level: "error", // log only errors to file
                    options: {
                      ...basePinoOptions,
                      destination: "logs/error.log",
                      mkdir: true,
                      sync: false,
                    },
                  },
                ],
              },
        },
        exclude: [{ method: RequestMethod.ALL, path: "doc" }],

      }),

    }),
  ],
  exports: [LoggerModule],
})
export class NestPinoModule { }
