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
			{ isObsolete: false },
			{
				limit,
				offset,
				orderBy: { createdAt: order.toLowerCase() },
			},
		);

		return createPaginationObject<User>(results, total, page, limit);
	}

	async getOne(index: string, userEntity?: User) {
		const user = await this.userRepository.findOne({ idx: index }).then(
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

		const user = this.userRepository.create(rest);

		await this.orm.em.transactional(async em => {
			const { url } = await this.cloudinaryService.uploadImage(image);

			// cloudinary gives a url key on response that is the full url to file

			user.avatar = url;

			await em.persistAndFlush(user);
			await this.mailService.sendMail({
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

	async editOne(index: string, dto: EditUserDto, userEntity?: User) {
		const user = await this.getOne(index, userEntity);

		wrap(user).assign(dto);

		await this.userRepository.flush();

		return user;
	}

	async deleteOne(index: string, userEntity?: User) {
		const user = await this.getOne(index, userEntity);

		this.userRepository.remove(user);

		return user;
	}
}
