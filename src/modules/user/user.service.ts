import { CreateUserDto } from '@dtos/create-user.dto';
import { UpdateUserDto } from '@dtos/update-user.dto';
import { User } from '@entities/User.entity';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
	BadRequestException,
	HttpException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: EntityRepository<User>,
	) {}

	create(createUserDto: CreateUserDto) {
		return 'This action adds a new user';
	}

	async findAll() {
		return { a: '10000' };
	}

	findOne(id: number): Promise<User> {
		return this.userRepository.findOne({ id });
	}

	update(id: number, updateUserDto: UpdateUserDto) {
		return `This action updates a #${id} user`;
	}

	remove(id: number) {
		return `This action removes a #${id} user`;
	}
}
