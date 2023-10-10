import { RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import { Injectable, Logger } from "@nestjs/common";
import { from, map, tap } from "rxjs";
import { MailerService } from "@lib/mailer/mailer.service";
import { MailPayload, Queues, RoutingKey } from "@common/@types";

@Injectable()
export class RabbitService {
  private logger = new Logger(RabbitService.name);

  constructor(private readonly mailService: MailerService) {}

  @RabbitSubscribe({
    routingKey: RoutingKey.SEND_MAIL,
    exchange: process.env.RABBITMQ_EXCHANGE,
    queue: Queues.MAIL,
  })
  sendMail(payload: MailPayload) {
    return from(
      this.mailService.sendMail({
        template: payload.template,
        replacements: payload.replacements,
        to: payload.to,
        subject: payload.subject,
        from: payload.from,
      }),
    ).pipe(map(tap(() => this.logger.log(`✅ Sent mail to ${payload.to}`))));
  }
}
