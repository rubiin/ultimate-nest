import { PageOptionsDto } from "@common/classes/pagination";
import { BaseRepository } from "@common/database/base.repository";
import { EmailTemplateEnum } from "@common/types/enums/misc.enum";
import { User } from "@entities";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { CloudinaryService } from "@lib/cloudinary/cloudinary.service";
import { createPaginationObject, Pagination } from "@lib/pagination";
import { MikroORM, wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { capitalize } from "helper-fns";
import { I18nService } from "nestjs-i18n";
import { from, map, Observable, switchMap } from "rxjs";

import { CreateUserDto, EditUserDto } from "./dtos";

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private userRepository: BaseRepository<User>,
		private readonly orm: MikroORM,
		private readonly i18nService: I18nService,
		private readonly configService: ConfigService,
		private readonly amqpConnection: AmqpConnection,
		private readonly cloudinaryService: CloudinaryService,
	) {}

	/**
	 * It returns an observable of a pagination object of users
	 * @param {PageOptionsDto}  - PageOptionsDto - This is a DTO that contains the following properties:
	 * @returns An observable of a pagination object.
	 */
	getMany({ limit, offset, order, sort, page }: PageOptionsDto): Observable<Pagination<User>> {
		return from(
			this.userRepository.findAndPaginate(
				{ isObsolete: false, isActive: true },
				{
					limit,
					offset,
					orderBy: { [sort]: order.toLowerCase() },
				},
			),
		).pipe(
			map(({ results, total }) => {
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
	getOne(index: string): Observable<User> {
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
						this.i18nService.t("exception.itemDoesNotExist", {
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
	 * @param dto - CreateUserDto & { image: Express.Multer.File }
	 * @returns The user object
	 */
	async createOne(dto: CreateUserDto & { image: Express.Multer.File }): Promise<User> {
		const { image, ...rest } = dto;
		const user = this.userRepository.create(rest);

		await this.orm.em.transactional(async em => {
			const { url } = await this.cloudinaryService.uploadImage(image);

			// cloudinary gives a url key on response that is the full url to file

			user.avatar = url;

			await em.persistAndFlush(user);

			await this.amqpConnection.publish(
				this.configService.get<string>("rabbit.exchange"),
				"send-mail",
				{
					template: EmailTemplateEnum.WELCOME_TEMPLATE,
					replacements: {
						firstName: capitalize(user.firstName),
						link: "example.com",
					},
					to: user.email,
					subject: "Welcome onboard",
					from: this.configService.get("mail.senderEmail"),
				},
			);
		});

		return user;
	}

	/**
	 * "Get a user, assign the DTO to it, and then flush the changes to the database."
	 *
	 * The first thing we do is get the user. We do this by calling the `getOne` function we created
	 * earlier
	 * @param {string} index - string - the index of the user to edit
	 * @param {EditUserDto} dto - EditUserDto
	 * @returns Observable<User>
	 */
	editOne(index: string, dto: EditUserDto): Observable<User> {
		return this.getOne(index).pipe(
			switchMap(user => {
				wrap(user).assign(dto);

				return from(this.userRepository.flush()).pipe(map(() => user));
			}),
		);
	}

	/**
	 * "Get the user, then delete it."
	 *
	 * The first thing we do is get the user. We do this by calling the `getOne` function we just created
	 * @param {string} index - string - The index of the user to delete.
	 * @returns Observable<User>
	 */
	deleteOne(index: string): Observable<User> {
		return this.getOne(index).pipe(
			switchMap(user => {
				return from(this.userRepository.softRemoveAndFlush(user)).pipe(map(() => user));
			}),
		);
	}
}
