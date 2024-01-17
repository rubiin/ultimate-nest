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
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configs, true>) => ({
        exchanges: [
          {
            name: configService.get("rabbitmq.exchange", { infer: true }),
            type: "topic",
          },
        ],
        uri: configService.get("rabbitmq.url", { infer: true }),
        connectionInitOptions: {
          wait: false,
          reject: true,
          timeout: 9000,
        },
        logger,
        channels: {
          "channel-1": {
            prefetchCount: +configService.get("rabbitmq.prefetchCount", {
              infer: true,
            }),
            default: true,
          },
          "channel-2": {
            prefetchCount: 2,
          },
        },
      }),
    }),
  ],
  providers: [ RabbitMQHealthCheckService],
  exports: [RabbitMQModule],
})
export class NestRabbitModule {}
