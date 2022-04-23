import { PageOptionsDto } from "@common/classes/pagination";
import { EmailTemplateEnum } from "@common/constants/misc.enum";
import { BaseRepository } from "@common/database/base.repository";
import { User } from "@entities";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { CloudinaryService } from "@lib/cloudinary/cloudinary.service";
import { createPaginationObject, Pagination } from "@lib/pagination";
import { MikroORM, wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { capitalize } from "helper-fns";
import { I18nService } from "nestjs-i18n";
import { from, map, Observable, switchMap } from "rxjs";
import { CreateUserDto, EditUserDto } from "./dtos";

interface ICreateUserWithFile extends CreateUserDto {
	image: Express.Multer.File;
}

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

	getMany({
		limit,
		offset,
		order,
		page,
	}: PageOptionsDto): Observable<Pagination<User>> {
		return from(
			this.userRepository.findAndPaginate(
				{ isObsolete: false },
				{
					limit,
					offset,
					orderBy: { createdAt: order.toLowerCase() },
				},
			),
		).pipe(
			map(({ results, total }) => {
				return createPaginationObject<User>(
					results,
					total,
					page,
					limit,
				);
			}),
		);
	}

	getOne(index: string, userEntity?: User): Observable<User> {
		return from(
			this.userRepository.findOne({ idx: index, isObsolete: false }),
		).pipe(
			map(u => {
				const user = !userEntity
					? u
					: !!u && userEntity.id === u.id
					? u
					: null;

				if (!user) {
					throw new NotFoundException(
						this.i18nService.t("status.USER_DOESNT_EXIST"),
					);
				} else {
					return user;
				}
			}),
		);
	}

	async createOne(dto: ICreateUserWithFile) {
		const userExist = await this.userRepository.findOne({
			email: dto.email,
		});

		if (userExist) {
			throw new BadRequestException(
				this.i18nService.t("status.USER_EMAIL_EXISTS"),
			);
		}

		const { image, ...rest } = dto;
		const user = this.userRepository.create(rest);

		await this.orm.em.transactional(async em => {
			const { url } = await this.cloudinaryService.uploadImage(image);

			// cloudinary gives a url key on response that is the full url to file

			user.avatar = url;

			await em.persistAndFlush(user);

			await this.amqpConnection.publish("nestify", "send-mail", {
				template: EmailTemplateEnum.WELCOME_TEMPLATE,
				replacements: {
					firstName: capitalize(user.firstName),
					link: "example.com",
				},
				to: user.email,
				subject: "Welcome onboard",
				from: this.configService.get("mail.senderEmail"),
			});
		});

		return user;
	}

	editOne(
		index: string,
		dto: EditUserDto,
		userEntity?: User,
	): Observable<User> {
		return this.getOne(index, userEntity).pipe(
			switchMap(user => {
				wrap(user).assign(dto);

				return from(this.userRepository.flush()).pipe(map(() => user));
			}),
		);
	}

	deleteOne(index: string, userEntity?: User): Observable<User> {
		return this.getOne(index, userEntity).pipe(
			switchMap(user => {
				return from(this.userRepository.softRemoveAndFlush(user)).pipe(
					map(() => user),
				);
			}),
		);
	}

	getVerifiedUserByEmail(email: string): Observable<User> {
		return from(this.userRepository.findOne({ email, isObsolete: false }));
	}
}
