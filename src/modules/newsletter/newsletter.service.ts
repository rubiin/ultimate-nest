import { BaseRepository } from "@common/database";
import { CursorPaginationDto } from "@common/dtos";
import { NewsLetter, Subscriber } from "@entities";
import { BaseService } from "@lib/crud/crud.service";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, NotFoundException } from "@nestjs/common";
import { Observable, from, map, mergeMap, of, switchMap, throwError } from "rxjs";
import { SubscribeNewsletterDto } from "./dto";
import { I18nContext } from "nestjs-i18n";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class NewsLetterService extends BaseService<NewsLetter, CursorPaginationDto> {
	protected readonly queryName = "t"; // the name of the query used in the pagination
	protected readonly searchField = "name"; // the field to search for when searching for tags
	constructor(
		// @ts-expect-error: Unused import error
		@InjectRepository(NewsLetter) private newsLetterRepository: BaseRepository<NewsLetter>,
		@InjectRepository(Subscriber) private subscriberRepository: BaseRepository<Subscriber>,
	) {
		super(newsLetterRepository);
	}

	findOneSubscription(email: string): Observable<Subscriber> {
		return from(this.subscriberRepository.findOne({ email })).pipe(
			mergeMap(entity => {
				if (!entity) {
					return throwError(
						() =>
							new NotFoundException(
								I18nContext.current<I18nTranslations>()!.t(
									"exception.itemDoesNotExist",
									{
										args: { item: "subscriber" },
									},
								),
							),
					);
				}

				return of(entity);
			}),
		);
	}

	subscribeNewsLetter(dto: SubscribeNewsletterDto): Observable<Subscriber> {
		return this.findOneSubscription(dto.email).pipe(
			switchMap(entity => {
				if (entity) {
					return throwError(
						() =>
							new NotFoundException(
								I18nContext.current<I18nTranslations>()!.t("exception.itemExists", {
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

	unSubscribeNewsLetter(dto: SubscribeNewsletterDto): Observable<Subscriber> {
		return this.findOneSubscription(dto.email).pipe(
			switchMap(subscriber => {
				return this.subscriberRepository
					.softRemoveAndFlush(subscriber)
					.pipe(map(() => subscriber));
			}),
		);
	}


	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  sendNewsLetter() {
	 // TODO: write logic to send newsletter
  }
}
