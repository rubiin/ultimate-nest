import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { Injectable } from "@nestjs/common";
import type { Observable } from "rxjs";
import { fromEvent, map, merge, of } from "rxjs";

@Injectable()
export class RabbitMQHealthCheckService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  check(): boolean {
    return this.amqpConnection.managedConnection.isConnected();
  }

  watch(): Observable<boolean> {
    return merge(
      of(this.check()),
      fromEvent(this.amqpConnection.managedConnection, "close").pipe(
        map(() => false),
      ),
      fromEvent(this.amqpConnection.managedConnection, "error").pipe(map(() => false)),
      fromEvent(this.amqpConnection.managedConnection, "connect").pipe(map(() => true)),
    );
  }
}
