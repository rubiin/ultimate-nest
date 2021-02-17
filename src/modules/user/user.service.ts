import { CreateUserDto } from '@dtos/create-user.dto';
import { UpdateUserDto } from '@dtos/update-user.dto';
import { User } from '@entities/User.entity';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { I18nRequestScopeService } from 'nestjs-i18n';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: EntityRepository<User>,
		private readonly i18n: I18nRequestScopeService,
	) {}

	create(createUserDto: CreateUserDto) {
		return `This action creates a #${createUserDto} user`;
	}

	async findAll() {
		return this.i18n.translate('operations.SUCCESS_MESSAGE');
	}

	async itThrows() {
		throw new HttpException(
			{ key: 'operations.HELLO', args: { username: 'rubin' } },
			HttpStatus.FORBIDDEN,
		);
	}

	findOne(id: number): Promise<User> {
		return this.userRepository.findOne({ id });
	}

	update(id: number, updateUserDto: UpdateUserDto) {
		return `This action updates a #${updateUserDto} user`;
	}

	remove(id: number) {
		return `This action removes a #${id} user`;
	}
}
