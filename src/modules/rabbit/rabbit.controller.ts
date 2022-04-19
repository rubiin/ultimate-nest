import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { Controller, Get } from "@nestjs/common";

@Controller("rabbit")
export class RabbitController {
	constructor(private readonly amqpConnection: AmqpConnection) {}

	@Get()
	rabbit() {
		this.amqpConnection.publish("exchange1", "rpc-route", {
			msg: "hello world",
		});
	}

	@Get("sentry")
	sentryTest() {
		throw new Error("test");
	}
}
