import { User } from '@entities/User.entity';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		@InjectRepository(User)
		private readonly usersRepo: EntityRepository<User>,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: 'some',
			ignoreExpiration: false,
		});
	}

	async validate(payload: { idx: string }): Promise<User> {
		const { idx } = payload;
		const user = await this.usersRepo.findOne({ idx });

		if (!user) {
			throw new UnprocessableEntityException('User not found');
		}

		return user;
	}
}
