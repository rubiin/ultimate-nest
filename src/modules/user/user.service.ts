import { User } from "@entities";
import { MailerService } from "@lib/mailer/mailer.service";
import { EntityManager, MikroORM, wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/postgresql";
import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from "@nestjs/common";
import { CreateUserDto, EditUserDto } from "./dtos";

export interface UserFindOne {
	id?: number;
	email?: string;
}

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: EntityRepository<User>,
		private readonly mailService: MailerService,
		private readonly orm: MikroORM,
		private readonly em: EntityManager,
	) {}

	async getMany() {
		return await this.userRepository.find({});
	}

	async getOne(id: number, userEntity?: User) {
		const user = await this.userRepository
			.findOne(id)
			.then(u =>
				!userEntity ? u : !!u && userEntity.id === u.id ? u : null,
			);

		if (!user)
			throw new NotFoundException("User does not exists or unauthorized");

		return user;
	}

	async createOne(dto: CreateUserDto) {
		const userExist = await this.userRepository.findOne({
			email: dto.email,
		});

		if (userExist) {
			throw new BadRequestException("User already registered with email");
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

		await this.userRepository.remove(user);

		return user;
	}

	async findOne(data: UserFindOne) {
		return await this.userRepository
			.createQueryBuilder("user")
			.where(data)
			.getSingleResult();
	}
}
