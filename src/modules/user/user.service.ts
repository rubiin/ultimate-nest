import { PageOptionsDto } from "@common/classes/pagination";
import { EmailTemplateEnum } from "@common/constants/template.enum";
import { BaseRepository } from "@common/database/base.repository";
import { User } from "@entities";
import { CloudinaryService } from "@lib/cloudinary/cloudinary.service";
import { MailerService } from "@lib/mailer/mailer.service";
import { createPaginationObject } from "@lib/pagination";
import { MikroORM, wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { capitalize } from "@rubiin/js-utils";
import { I18nService } from "nestjs-i18n";
import { CreateUserDto, EditUserDto } from "./dtos";

interface ICreateUserWithFile extends CreateUserDto {
	image: Express.Multer.File;
}

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private userRepository: BaseRepository<User>,
		private readonly mailService: MailerService,
		private readonly orm: MikroORM,
		private readonly i18nService: I18nService,
		private readonly configService: ConfigService,
		private readonly cloudinaryService: CloudinaryService,
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

	async getOne(idx: string, userEntity?: User) {
		const user = await this.userRepository.findOne({ idx }).then(
			u => (!userEntity ? u : !!u && userEntity.id === u.id ? u : null), // checks if self update
		);

		if (!user)
			throw new NotFoundException(
				this.i18nService.t("status.USER_DOESNT_EXIST"),
			);

		return user;
	}

	async createOne(dto: ICreateUserWithFile) {
		const userExist = await this.userRepository.findOne({
			email: dto.email,
		});

		const { image, ...rest } = dto;

		if (userExist) {
			throw new BadRequestException(
				this.i18nService.t("status.USER_EMAIL_EXISTS"),
			);
		}

		const newUser = this.userRepository.create(rest);

		await this.orm.em.transactional(async em => {
			const { url } = await this.cloudinaryService.uploadImage(image);

			// cloudinary gives a url key on response that is the full url to file

			newUser.avatar = url;

			await em.persistAndFlush(newUser);
			await this.mailService.sendMail({
				template: EmailTemplateEnum.WELCOME_TEMPLATE,
				replacements: {
					firstName: capitalize(newUser.firstName),
					link: "example.com",
				},
				to: newUser.email,
				subject: "Welcome onboard",
				from: this.configService.get("mail.senderEmail"),
			});
		});

		return newUser;
	}

	async editOne(idx: string, dto: EditUserDto, userEntity?: User) {
		const user = await this.getOne(idx, userEntity);

		wrap(user).assign(dto);

		await this.userRepository.flush();

		return user;
	}

	async deleteOne(idx: string, userEntity?: User) {
		const user = await this.getOne(idx, userEntity);

		this.userRepository.remove(user);

		return user;
	}
}
