import process from "node:process";

import { NewsLetterLogStatus, Queues, RoutingKey } from "@common/@types";
import { BaseRepository } from "@common/database";
import { NewsLetter, NewsLetterLog, Subscriber } from "@entities";
import { RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import { NewsletterMail } from "@lib/mail";
import { MikroORM, RequestContext } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { ref } from "@mikro-orm/postgresql";
import { Injectable, Logger } from "@nestjs/common";
import { Mailer } from "@nestjs/mail";
import { type ResiliencePolicy, ResilienceService } from "@nestjs/resilience";

import type { NewsLetterMessage } from "./newsletter.message";
import { NewsLetterService } from "./newsletter.service";

@Injectable()
export class NewsLetterConsumer {
  private readonly logger = new Logger(NewsLetterConsumer.name);

  /**
   * The `mail` preset as a policy: a broker callback is not an entrypoint
   * either, and this shares the mail breaker with `PATCH /auth/forgot-password`.
   */
  private readonly mailPolicy: ResiliencePolicy;

  constructor(
    @InjectRepository(NewsLetter) private readonly newsLetterRepository: BaseRepository<NewsLetter>,
    @InjectRepository(Subscriber)
    private readonly subscriberRepository: BaseRepository<Subscriber>,
    @InjectRepository(NewsLetterLog)
    private readonly logRepository: BaseRepository<NewsLetterLog>,
    private readonly newsLetterService: NewsLetterService,
    private readonly mailer: Mailer,
    private readonly orm: MikroORM,
    resilience: ResilienceService,
  ) {
    this.mailPolicy = resilience.preset("mail");
  }

  @RabbitSubscribe({
    exchange: process.env.RABBITMQ_EXCHANGE,
    queue: Queues.NEWSLETTER,
    routingKey: RoutingKey.SEND_NEWSLETTER,
  })
  handle(message: NewsLetterMessage) {
    // A broker callback has no HTTP request to fork the entity manager from.
    return RequestContext.create(this.orm.em, async () => this.deliver(message));
  }

  /**
   * Mails one subscriber and records the outcome. Never throws: a failed send is stored as FAILED
   * rather than requeued, which would redeliver the same message in a loop.
   */
  private async deliver({ newsLetterIdx, subscriberIdx }: NewsLetterMessage) {
    const [newsLetter, subscriber] = await Promise.all([
      this.newsLetterRepository.findOne({ idx: newsLetterIdx }),
      this.subscriberRepository.findOne({ idx: subscriberIdx }),
    ]);

    // Unsubscribed (soft deleted) between publish and delivery.
    if (!newsLetter || !subscriber) return;

    const existing = await this.logRepository.findOne({ newsLetter, subscriber });

    // The same message can be redelivered, or the whole batch republished after a partial failure.
    if (existing?.status === NewsLetterLogStatus.SENT) return;

    const log =
      existing ??
      new NewsLetterLog({
        newsLetter: ref(newsLetter),
        status: NewsLetterLogStatus.FAILED,
        subscriber: ref(subscriber),
      });

    try {
      await this.mailPolicy.execute(
        async () =>
          this.mailer.send(NewsletterMail, {
            to: subscriber.email,
            data: {
              content: newsLetter.content,
              subject: newsLetter.name,
              unsubscribeUrl: await this.newsLetterService.unsubscribeUrl(subscriber),
            },
          }),
        { source: "NewsLetterConsumer.deliver" },
      );
      log.status = NewsLetterLogStatus.SENT;
      log.error = undefined;
    } catch (error) {
      log.status = NewsLetterLogStatus.FAILED;
      log.error = error instanceof Error ? error.message : String(error);
      this.logger.error(`Newsletter "${newsLetter.name}" to ${subscriber.email}: ${log.error}`);
    }

    log.attemptedAt = new Date();
    await this.logRepository.getEntityManager().persist(log).flush();
  }
}
