import { Module, RequestMethod } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";

// Fields to redact from logs
const redactFields = ["req.headers.authorization", "req.body.password", "req.body.confirmPassword"];
const basePinoOptions = {
  ignore: "pid,hostname",
  redact: redactFields,
  singleLine: true,
  translateTime: true,
};

@Module({
  exports: [LoggerModule],
  imports: [
    LoggerModule.forRoot({
      exclude: [{ method: RequestMethod.ALL, path: "doc" }],
      pinoHttp: {
        customProps: () => ({
          context: "HTTP",
        }),
        name: "ultimate-nest",
        redact: {
          censor: "**GDPR COMPLIANT**",
          paths: redactFields,
        },
        serializers: {
          req(request: {
            body: Record<string, any>;
            raw: {
              body: Record<string, any>;
            };
          }) {
            request.body = request.raw.body;

            return request;
          },
        },
        timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
        transport:
          process.env.NODE_ENV === "production"
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
    }),
  ],
})
export class NestPinoModule {}
