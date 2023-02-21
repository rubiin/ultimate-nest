import { IMailPayload } from "@common/@types";
import { RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import { MailerService } from "@lib/mailer/mailer.service";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class RabbitService {
	private logger = new Logger(RabbitService.name);

	constructor(private readonly mailService: MailerService) {}

	@RabbitSubscribe({
		routingKey: "send-mail",
		exchange: process.env.RABBITMQ_EXCHANGE,
		queue: process.env.RABBITMQ_QUEUE,
		createQueueIfNotExists: true,
	})
	public async sendMail(payload: IMailPayload) {
		await this.mailService.sendMail({
			template: payload.template,
			replacements: payload.replacements,
			to: payload.to,
			subject: payload.subject,
			from: payload.from,
		});

		this.logger.debug(`✅ Sent mail to ${payload.to}`);
	}
}
