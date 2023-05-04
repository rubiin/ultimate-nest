import { EmailSubjects, EmailTemplateEnum, IBaseService } from "@common/@types";
import { DtoWithFile } from "@common/@types/types";
import { BaseRepository } from "@common/database";
import { SearchOptionsDto } from "@common/dtos/search.dto";
import { User } from "@entities";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { IConfig } from "@lib/config/config.interface";
import { PageMetaDto, Pagination } from "@lib/pagination";
import { EntityManager } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createId } from "@paralleldrive/cuid2";
import { capitalize, slugify } from "helper-fns";
import { CloudinaryService } from "nestjs-cloudinary";
import { I18nContext } from "nestjs-i18n";
import { from, map, mergeMap, Observable, of, switchMap, throwError } from "rxjs";

import { CreateUserDto, EditUserDto } from "./dtos";

@Injectable()
export class UserService implements IBaseService<User> {
	constructor(
		@InjectRepository(User)
		private userRepository: BaseRepository<User>,
		private readonly em: EntityManager,
		private readonly configService: ConfigService<IConfig, true>,
		private readonly amqpConnection: AmqpConnection,
		private readonly cloudinaryService: CloudinaryService,
	) {}

	/**
	 * It returns an observable of a pagination object of users
	 * @returns An observable of a pagination object.
	 */
	findAll(pageOptionsDto: SearchOptionsDto): Observable<Pagination<User>> {
		const { limit, offset, order, sort, search } = pageOptionsDto;
		const qb = this.userRepository.qb("u").select("u.*");

		if (search) {
			qb.andWhere({ firstName: { $ilike: `%${search}%` } });
		}

		qb.orderBy({ [sort]: order.toLowerCase() })
			.limit(limit)
			.offset(offset);

		const pagination$ = from(qb.getResultAndCount());

		return pagination$.pipe(
			map(([results, itemCount]) => {
				const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });

				return new Pagination(results, pageMetaDto);
			}),
		);
	}

	/**
	 * It returns an observable of a user entity, which is either the user entity that was passed in, or
	 * the user entity that was found in the database
	 * @param {string} index - string - the index of the user you want to get
	 * @returns Observable<User>
	 */
	findOne(index: string): Observable<User> {
		return from(
			this.userRepository.findOne({
				idx: index,
				isActive: true,
				isObsolete: false,
			}),
		).pipe(
			mergeMap(user => {
				if (!user) {
					return throwError(() =>
						I18nContext.current<I18nTranslations>()!.t("exception.itemDoesNotExist", {
							args: { item: "User" },
						}),
					);
				}

				return of(user);
			}),
		);
	}

	/**
	 * It creates a user and sends a welcome email
	 * @param dto - CreateWithFile<CreateUserDto>
	 * @returns The user object
	 */
	create(dto: DtoWithFile<CreateUserDto>): Observable<User> {
		const { files, ...rest } = dto;
		const user = this.userRepository.create(rest);

		return from(
			this.em.transactional(async em => {
				const { url } = await this.cloudinaryService.uploadFile(files);

				// cloudinary gives a url key on response that is the full url to file

				user.avatar = url;

				await em.persistAndFlush(user);
				const link = this.configService.get("app.clientUrl", { infer: true });

				await this.amqpConnection.publish(
					this.configService.get("rabbitmq.exchange", { infer: true }),
					"send-mail",
					{
						template: EmailTemplateEnum.WELCOME_TEMPLATE,
						replacements: {
							firstName: capitalize(user.firstName),
							link,
						},
						to: user.email,
						subject: EmailSubjects.WELCOME,
						from: this.configService.get("mail.senderEmail", { infer: true }),
					},
				);
			}),
		).pipe(map(() => user));
	}

	/**
	 * "Get a user, assign the DTO to it, and then flush the changes to the database."
	 *
	 * The first thing we do is get the user. We do this by calling the `findOne` function we created
	 * earlier
	 * @param {string} index - string - the index of the user to edit
	 * @param {EditUserDto} dto - EditUserDto
	 * @returns Observable<User>
	 */
	update(index: string, dto: EditUserDto): Observable<User> {
		return this.findOne(index).pipe(
			switchMap(user => {
				this.userRepository.assign(user, dto);

				return from(this.em.flush()).pipe(map(() => user));
			}),
		);
	}

	/**
	 * "Get the user, then delete it."
	 *
	 * The first thing we do is get the user. We do this by calling the `findOne` function we just created
	 * @param {string} index - string - The index of the user to delete.
	 * @returns Observable<User>
	 */
	remove(index: string): Observable<User> {
		return this.findOne(index).pipe(
			switchMap(user => {
				return this.userRepository.softRemoveAndFlush(user).pipe(map(() => user));
			}),
		);
	}

	/**
	 * This function generates a unique username based on a given name and a random ID, and checks if it
	 * already exists in the database before returning it.
	 * @param {string} name - The `name` parameter is a string representing the name of the user for whom
	 * a username is being generated.
	 * @returns An Observable of type string is being returned.
	 */
	generateUsername(name: string): Observable<string> {
		const pointSlug = slugify(`${name} ${createId().slice(0, 6)}`, {
			lowercase: true,
		});

		return from(
			this.userRepository.count({
				username: {
					$like: `${pointSlug}%`,
				},
			}),
		).pipe(
			map(count => {
				if (count > 0) {
					return `${pointSlug}${count}`;
				}

				return pointSlug;
			}),
		);
	}
}
