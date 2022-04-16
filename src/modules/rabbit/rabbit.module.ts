import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { Module } from "@nestjs/common";
import { RabbitController } from "./rabbit.controller";
import { RabbitService } from "./rabbit.service";

@Module({
	imports: [
		RabbitMQModule.forRoot(RabbitMQModule, {
			exchanges: [
				{
					name: "exchange1",
					type: "topic",
				},
			],
			uri: process.env.RABBIT_MQ_URI,
			connectionInitOptions: { wait: false },
		}),
	],
	controllers: [RabbitController],
	providers: [RabbitService],
})
export class RabbitModule {}
