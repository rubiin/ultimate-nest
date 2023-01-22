import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { IConfig } from "@lib/config/config.interface";
import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { NestConfigModule } from "..";
import { RabbitService } from "./rabbit.service";

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
			}),
			inject: [ConfigService],
		}),
	],
	controllers: [],
	providers: [RabbitService],
	exports: [RabbitService, RabbitMQModule],
})
export class NestRabbitModule {}
