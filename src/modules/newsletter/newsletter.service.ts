import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import type { Observable } from "rxjs";
import { from, map, mergeMap, of, switchMap, throwError } from "rxjs";

import { itemDoesNotExistKey, translate } from "@lib/i18n";
import { BaseService } from "@lib/crud/crud.service";
import { NewsLetter, Subscriber } from "@entities";
import type { CursorPaginationDto } from "@common/dtos";
import { BaseRepository } from "@common/database";
import { EmailSubject, EmailTemplate, RoutingKey } from "@common/@types";
import type { SubscribeNewsletterDto } from "./dto";

@Injectable()
export class NewsLetterService extends BaseService<NewsLetter, CursorPaginationDto> {
  protected readonly queryName = "t"; // the name of the query used in the pagination
  protected readonly searchField = "name"; // the field to search for when searching for tags
  constructor(
// @ts-expect-error: Unused import error
@InjectRepository(NewsLetter) private newsLetterRepository: BaseRepository<NewsLetter>,
@InjectRepository(Subscriber) private subscriberRepository: BaseRepository<Subscriber>,
private readonly amqpConnection: AmqpConnection,
private readonly configService: ConfigService<Configs, true>,
  ) {
    super(newsLetterRepository);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async sendNewsLetter() {
    const subscribers = await this.subscriberRepository.findAll({});
    const promises = [];

    for (const subscriber of subscribers) {
      promises.push(
        this.amqpConnection.publish(
          this.configService.get("rabbitmq.exchange", { infer: true }),
          RoutingKey.SEND_NEWSLETTER,
          {
            template: EmailTemplate.WELCOME_TEMPLATE,
            to: subscriber.email,
            subject: EmailSubject.WELCOME,
            from: this.configService.get("mail.senderEmail", { infer: true }),
          },
        ),
      );
    }
    await Promise.allSettled(promises);
  }

  /**
   * This function finds a subscriber by their email and returns an observable that emits the subscriber
   * entity or throws a NotFoundException if the entity does not exist.
   * @param email - The email parameter is a string that represents the email address of the
   * subscriber whose subscription is being searched for.
   * @returns An Observable of type `Subscriber`.
   */
  findOneSubscription(email: string): Observable<Subscriber> {
    return from(this.subscriberRepository.findOne({ email })).pipe(
      mergeMap((entity) => {
        if (!entity) {
          return throwError(
            () =>
              new NotFoundException(
                translate(itemDoesNotExistKey, {
                  args: { item: "subscriber" },
                }),
              ),
          );
        }

        return of(entity);
      }),
    );
  }

  /**
   * This function subscribes a new user to a newsletter and returns an observable of the new subscriber.
   * @param dto - SubscribeNewsletterDto object containing the email and name of
   * the subscriber.
   * @returns The `subscribeNewsLetter` method returns an `Observable` that emits a `Subscriber` object.
   */
  subscribeNewsLetter(dto: SubscribeNewsletterDto): Observable<Subscriber> {
    return this.findOneSubscription(dto.email).pipe(
      switchMap((entity) => {
        if (entity) {
          return throwError(
            () =>
              new NotFoundException(
                translate("exception.itemExists", {
                  args: { item: "subscriber", property: "email" },
                }),
              ),
          );
        }
        const subscriber = this.subscriberRepository.create(dto);

        return from(
          this.subscriberRepository.getEntityManager().persistAndFlush(subscriber),
        ).pipe(map(() => subscriber));
      }),
    );
  }

  /**
   * This function unsubscribes a subscriber from a newsletter by finding their subscription and removing
   * it.
   * @param dto - SubscribeNewsletterDto object which contains the email of the
   * subscriber who wants to unsubscribe from the newsletter.
   * @returns The `unSubscribeNewsLetter` method returns an Observable of type `Subscriber`.
   */
  unSubscribeNewsLetter(dto: SubscribeNewsletterDto): Observable<Subscriber> {
    return this.findOneSubscription(dto.email).pipe(
      switchMap((subscriber) => {
        return this.subscriberRepository
          .softRemoveAndFlush(subscriber)
          .pipe(map(() => subscriber));
      }),
    );
  }
}
