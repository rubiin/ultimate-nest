import { EntityRepository } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { User } from '@entities';
import { CreateUserDto } from './dtos/create-user.dto';
import { EditUserDto } from './dtos/update-user.dto';
import { wrap } from '@mikro-orm/core';
import { omit } from '@rubiin/js-utils';

export interface UserFindOne {
  id?: number;
  email?: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
  ) {}

  async getMany() {
    return await this.userRepository.findAll();
  }

  async getOne(id: number, userEntity?: User) {
    const user = await this.userRepository
      .findOne(id)
      .then(u => (!userEntity ? u : !!u && userEntity.id === u.id ? u : null));

    if (!user)
      throw new NotFoundException('User does not exists or unauthorized');

    return user;
  }

  async createOne(dto: CreateUserDto) {
    const userExist = await this.userRepository.findOne({ email: dto.email });
    if (userExist)
      throw new BadRequestException('User already registered with email');

    const newUser = this.userRepository.create(dto);
    await this.userRepository.persistAndFlush(newUser);

    return omit(newUser,['password'])
  }

  async editOne(id: number, dto: EditUserDto, userEntity?: User) {
    const user = await this.getOne(id, userEntity);
    wrap(user).assign(dto);
    await this.userRepository.flush();
    return user
  }

  async deleteOne(id: number, userEntity?: User) {
    const user = await this.getOne(id, userEntity);
    return this.userRepository.remove(user);
  }

  async findOne(data: UserFindOne) {
    return await this.userRepository.createQueryBuilder()
      .where(data)
      .addSelect('user.password')
      .getSingleResult()
  }
}