import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { IConfig } from "@lib/config/config.interface";
import { NestConfigModule } from "@lib/config/config.module";
import { Global, Logger, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { RabbitService } from "./rabbit.service";

const logger = new Logger("RabbitMQ");

@Global()
@Module({
	imports: [
		RabbitMQModule.forRootAsync(RabbitMQModule, {
			imports: [NestConfigModule],
			useFactory: (configService: ConfigService<IConfig, true>) => ({
				exchanges: [
					{
						name: configService.get("rabbitmq.exchange", { infer: true }),
						type: "topic",
					},
				],
				uri: configService.get("rabbitmq.url", { infer: true }),
				connectionInitOptions: { wait: false },
				logger: logger,
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
			inject: [ConfigService],
		}),
	],
	providers: [RabbitService],
	exports: [RabbitService, RabbitMQModule],
})
export class NestRabbitModule {}
