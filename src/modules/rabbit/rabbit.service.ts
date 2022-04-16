import { RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import { Injectable } from "@nestjs/common";

@Injectable()
export class RabbitService {
	@RabbitSubscribe({
		exchange: "exchange1",
		routingKey: "rpc-route",
		queue: "rpc-queue",
	})
	public async rpcHandler(message: Record<string, any>) {
		console.info(`Received message: ${JSON.stringify(message)}`);
	}
}
