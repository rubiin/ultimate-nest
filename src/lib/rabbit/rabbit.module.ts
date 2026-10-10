import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { Global, Logger, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { RabbitMQHealthCheckService } from "./healthcheck";

const logger = new Logger("RabbitMQ");

// for delayed messages, check the following links
// https://reachmnadeem.wordpress.com/2022/02/19/adding-another-plugin-to-rabbit-management-docker-image/
// https://github.com/golevelup/nestjs/issues/311

@Global()
@Module({
  exports: [RabbitMQModule],
  imports: [
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configs, true>) => ({
        channels: {
          "channel-1": {
            default: true,
            prefetchCount: +configService.get("rabbitmq.prefetchCount", {
              infer: true,
            }),
          },
          "channel-2": {
            prefetchCount: 2,
          },
        },
        connectionInitOptions: {
          reject: true,
          timeout: 9000,
          wait: false,
        },
        exchanges: [
          {
            name: configService.get("rabbitmq.exchange", { infer: true }),
            type: "topic",
          },
        ],
        logger,
        uri: configService.get("rabbitmq.url", { infer: true }),
      }),
    }),
  ],
  providers: [RabbitMQHealthCheckService],
})
export class NestRabbitModule {}
