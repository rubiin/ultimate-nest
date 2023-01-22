import { PageOptionsDto } from "@common/classes/pagination";
import { BaseRepository } from "@common/database";
import { EmailTemplateEnum, ICommonService, IFile } from "@common/types";
import { User } from "@entities";
import { I18nTranslations } from "@generated";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { IConfig } from "@lib/config/config.interface";
import { createPaginationObject, Pagination } from "@lib/pagination";
import { EntityManager } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { capitalize } from "helper-fns";
import { CloudinaryService } from "nestjs-cloudinary";
import { I18nContext } from "nestjs-i18n";
import { from, map, Observable, switchMap } from "rxjs";

import { CreateUserDto, EditUserDto } from "./dtos";

@Injectable()
export class UserService implements ICommonService<User> {
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
	 * @param {PageOptionsDto}  - PageOptionsDto - This is a DTO that contains the following properties:
	 * @returns An observable of a pagination object.
	 */
	findAll({
		limit,
		offset,
		order,
		sort,
		page,
		search,
	}: PageOptionsDto): Observable<Pagination<User>> {
		const qb = this.userRepository.createQueryBuilder("u").select("u.*");

		if (search) {
			qb.andWhere({ firstName: { $ilike: `%${search}%` } });
		}

		qb.orderBy({ [sort]: order.toLowerCase() })
			.limit(limit)
			.offset(offset);

		const pagination$ = from(qb.getResultAndCount());

		return pagination$.pipe(
			map(([results, total]) => {
				return createPaginationObject<User>(results, total, page, limit, "users");
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
				isObsolete: false,
				isActive: true,
			}),
		).pipe(
			map(user => {
				if (!user) {
					throw new NotFoundException(
						I18nContext.current<I18nTranslations>().t("exception.itemDoesNotExist", {
							args: { item: "User" },
						}),
					);
				}

				return user;
			}),
		);
	}

	/**
	 * It creates a user and sends a welcome email
	 * @param dto - CreateUserDto & { image: IFile }
	 * @returns The user object
	 */
	async create(dto: CreateUserDto & { image: IFile }): Promise<User> {
		const { image, ...rest } = dto;
		const user = this.userRepository.create(rest);

		await this.em.transactional(async em => {
			const { url } = await this.cloudinaryService.uploadFile(image);

			// cloudinary gives a url key on response that is the full url to file

			user.avatar = url;

			await em.persistAndFlush(user);
			const link = this.configService.get("app.clientUrl", { infer: true });

			this.amqpConnection.publish(
				this.configService.get("rabbitmq.exchange", { infer: true }),
				"send-mail",
				{
					template: EmailTemplateEnum.WELCOME_TEMPLATE,
					replacements: {
						firstName: capitalize(user.firstName),
						link,
					},
					to: user.email,
					subject: "Welcome onboard",
					from: this.configService.get("mail.senderEmail", { infer: true }),
				},
			);
		});

		return user;
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

				return from(this.userRepository.flush()).pipe(map(() => user));
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
				return from(this.userRepository.softRemoveAndFlush(user)).pipe(map(() => user));
			}),
		);
	}
}
