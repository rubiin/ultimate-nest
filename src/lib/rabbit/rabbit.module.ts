import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { RabbitService } from "./rabbit.service";

@Global()
@Module({
	imports: [
		RabbitMQModule.forRootAsync(RabbitMQModule, {
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				exchanges: [
					{
						name: configService.get("rabbitmq.exchange"),
						type: "topic",
					},
				],
				uri: configService.get("rabbitmq.uri"),
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
