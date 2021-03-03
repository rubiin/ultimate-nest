import { CreateUserDto } from '@modules/user/dtos/create-user.dto';
import { UpdateUserDto } from '@modules/user/dtos/update-user.dto';
import { User } from '@entities';
import { EntityRepository, wrap } from '@mikro-orm/core';
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

	async create(createuserDto: CreateUserDto): Promise<User> {
		const user = this.userRepository.create(createuserDto);

		await this.userRepository.persistAndFlush(user);

		return user;
	}

	async findAll(): Promise<User[]> {
		const user = await this.userRepository.findAll();

		if (user) {
			throw new HttpException('No user', HttpStatus.NOT_FOUND);
		}

		return user;
	}

	async findOne(idx: string): Promise<User> {
		const user = await this.userRepository.findOne({
			idx,
			isActive: true,
			isObsolete: false,
		});

		if (user) {
			throw new HttpException('No user with idx', HttpStatus.NOT_FOUND);
		}

		return user;
	}

	async update(idx: string, updateuserDto: UpdateUserDto): Promise<User> {
		const user = await this.userRepository.findOne({ idx });

		wrap(user).assign(updateuserDto);
		await this.userRepository.flush();

		return user;
	}

	async remove(idx: string) {
		return this.userRepository.remove({ idx });
	}
}
