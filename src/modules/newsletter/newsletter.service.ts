import { JwtPayload, RoutingKey } from "@common/@types";
import { BaseRepository } from "@common/database";
import { CursorPaginationDto } from "@common/dtos";
import { NewsLetter, Subscriber } from "@entities";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { BaseService } from "@lib/crud/crud.service";
import { itemDoesNotExistKey, translate } from "@lib/i18n";
import { InjectRepository } from "@mikro-orm/nestjs";
import { JwtService } from "@nestjs/jwt";
import { MikroORM, RequestContext } from "@mikro-orm/core";
import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CircuitOpenError, type ResiliencePolicy, ResilienceService } from "@nestjs/resilience";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Observable } from "rxjs";
import { catchError, from, map, mergeMap, of, switchMap, throwError } from "rxjs";

import { SubscribeNewsletterDto } from "./dto";
import type { NewsLetterMessage } from "./newsletter.message";

const UNSUBSCRIBE_LINK_EXPIRY = "365d";

const isCircuitOpen = (result: PromiseSettledResult<unknown>) =>
  result.status === "rejected" && result.reason instanceof CircuitOpenError;

@Injectable()
export class NewsLetterService extends BaseService<NewsLetter, CursorPaginationDto> {
  protected readonly queryName = "t"; // the name of the query used in the pagination
  protected readonly searchField = "name"; // the field to search for when searching for tags
  private readonly logger = new Logger(NewsLetterService.name);

  /**
   * The `rabbitmq` preset as a policy. A cron job is not an entrypoint, so
   * decorators would not reach it; the breaker it shares with the routes is
   * what stops this from retrying a broker that is already down.
   */
  private readonly rabbitPolicy: ResiliencePolicy;

  constructor(
    @InjectRepository(NewsLetter) private newsLetterRepository: BaseRepository<NewsLetter>,
    @InjectRepository(Subscriber) private subscriberRepository: BaseRepository<Subscriber>,
    private readonly amqpConnection: AmqpConnection,
    private readonly configService: ConfigService<Configs, true>,
    private readonly orm: MikroORM,
    private readonly jwtService: JwtService,
    resilience: ResilienceService,
  ) {
    super(newsLetterRepository);
    this.rabbitPolicy = resilience.preset("rabbitmq");
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async sendNewsLetter() {
    // A cron job runs outside any HTTP request, so there is no request context to
    // fork from. Without this, the repository call runs on the global identity map.
    return RequestContext.create(this.orm.em, async () => this.publishNewsLetter());
  }

  /**
   * Queues every newsletter that has not been dispatched to every subscriber, then stamps it
   * `sentAt`. A newsletter whose publishes did not all succeed stays unstamped and is retried on
   * the next run; the consumer skips recipients it already mailed.
   */
  private async publishNewsLetter() {
    const newsLetters = await this.newsLetterRepository.find({ sentAt: null });

    if (newsLetters.length === 0) return;

    const subscribers = await this.subscriberRepository.findAll({});

    if (subscribers.length === 0) return;

    for (const newsLetter of newsLetters) {
      const results = await Promise.allSettled(
        subscribers.map((subscriber) => this.publishToSubscriber(newsLetter, subscriber)),
      );

      if (results.every((result) => result.status === "fulfilled")) {
        newsLetter.sentAt = new Date();
        continue;
      }

      // An open breaker sheds every remaining publish, so stop here rather than
      // rejecting one message per subscriber until the next nightly run.
      if (results.some(isCircuitOpen)) {
        this.logger.warn(
          "Broker is unavailable; skipping the remaining newsletters until it recovers",
        );
        break;
      }
    }

    await this.newsLetterRepository.getEntityManager().flush();
  }

  private async publishToSubscriber(newsLetter: NewsLetter, subscriber: Subscriber) {
    return this.rabbitPolicy.execute(
      () =>
        this.amqpConnection.publish(
          this.configService.get("rabbitmq.exchange", { infer: true }),
          RoutingKey.SEND_NEWSLETTER,
          {
            newsLetterIdx: newsLetter.idx!,
            subscriberIdx: subscriber.idx!,
          } satisfies NewsLetterMessage,
        ),
      { source: "NewsLetterService.publishNewsLetter" },
    );
  }

  /**
   * Signed link a subscriber can follow, without logging in, to unsubscribe. It lives a year so
   * old emails keep working.
   * @param subscriber - The subscriber the link is for.
   */
  async unsubscribeUrl(subscriber: Subscriber): Promise<string> {
    const token = await this.jwtService.signAsync(
      { type: "unsubscribe" satisfies NonNullable<JwtPayload["type"]> },
      { expiresIn: UNSUBSCRIBE_LINK_EXPIRY, subject: subscriber.idx! },
    );
    const url = this.configService.get("app.url", { infer: true });
    const prefix = this.configService.get("app.prefix", { infer: true });

    return `${url}/${prefix}/newsletter/unsubscribe/${token}`;
  }

  /**
   * Unsubscribes the subscriber named by a link from `unsubscribeUrl`. Following it twice is fine.
   * @param token - The token from the link.
   * @throws BadRequestException when the token is invalid, expired or not an unsubscribe token.
   */
  unSubscribeWithToken(token: string): Observable<{ message: string }> {
    return from(this.jwtService.verifyAsync<{ sub?: string; type?: string }>(token)).pipe(
      catchError(() =>
        throwError(() => new BadRequestException(translate("exception.badRequest"))),
      ),
      switchMap((payload) => {
        if (payload.type !== "unsubscribe" || !payload.sub)
          return throwError(() => new BadRequestException(translate("exception.badRequest")));

        return from(this.subscriberRepository.findOne({ idx: payload.sub }));
      }),
      switchMap((subscriber) =>
        subscriber ? this.subscriberRepository.softRemoveAndFlush(subscriber) : of(null),
      ),
      map(() => ({ message: "You have been unsubscribed" })),
    );
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
    // Looked up directly rather than through `findOneSubscription`, which throws
    // when there is no match - exactly the case a new subscriber hits.
    return from(this.subscriberRepository.findOne({ email: dto.email })).pipe(
      switchMap((entity) => {
        if (entity) {
          return throwError(
            () =>
              new BadRequestException(
                translate("exception.itemExists", {
                  args: { item: "subscriber", property: "email" },
                }),
              ),
          );
        }

        const subscriber = this.subscriberRepository.create(dto);

        return from(this.subscriberRepository.getEntityManager().persist(subscriber).flush()).pipe(
          map(() => subscriber),
        );
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
        return this.subscriberRepository.softRemoveAndFlush(subscriber).pipe(map(() => subscriber));
      }),
    );
  }
}
