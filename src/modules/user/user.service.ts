import { PageOptionsDto } from "@common/classes/pagination";
import { BaseRepository } from "@common/database/base.repository";
import { User } from "@entities";
import { MailerService } from "@lib/mailer/mailer.service";
import { createPaginationObject } from "@lib/pagination";
import { MikroORM, wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { CreateUserDto, EditUserDto } from "./dtos";

export interface UserFindOne {
	id?: number;
	email?: string;
}

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private userRepository: BaseRepository<User>,
		private readonly mailService: MailerService,
		private readonly orm: MikroORM,
		private readonly i18nService: I18nService,
	) {}

	async getMany({ limit, offset, order, page }: PageOptionsDto) {
		const { results, total } = await this.userRepository.findAndPaginate(
			{},
			{
				limit,
				offset,
				orderBy: { createdAt: order.toLowerCase() },
			},
		);

		return createPaginationObject<User>(results, total, page, limit);
	}

	async getOne(id: number, userEntity?: User) {
		const user = await this.userRepository
			.findOne(id)
			.then(u =>
				!userEntity ? u : !!u && userEntity.id === u.id ? u : null,
			);

		if (!user)
			throw new NotFoundException(
				this.i18nService.t("status.USER_DOESNT_EXIST"),
			);

		return user;
	}

	async createOne(dto: CreateUserDto) {
		const userExist = await this.userRepository.findOne({
			email: dto.email,
		});

		if (userExist) {
			throw new BadRequestException(
				this.i18nService.t("status.USER_EMAIL_EXISTS"),
			);
		}

		const newUser = this.userRepository.create(dto);

		await this.orm.em.transactional(async em => {
			await em.persistAndFlush(newUser);

			await this.mailService.sendMail({
				template: "welcome",
				replacements: {
					firstName: newUser.firstName,
					link: "example.com",
				},
				to: newUser.email,
			});
		});

		return newUser;
	}

	async editOne(id: number, dto: EditUserDto, userEntity?: User) {
		const user = await this.getOne(id, userEntity);

		wrap(user).assign(dto);

		await this.userRepository.flush();

		return user;
	}

	async deleteOne(id: number, userEntity?: User) {
		const user = await this.getOne(id, userEntity);

		this.userRepository.remove(user);

		return user;
	}
}
