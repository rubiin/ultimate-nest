import { User } from '@entities';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, UnauthorizedException } from '@nestjs/common';
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

	async validate(payload: { idx: string }, done) {
		const { idx } = payload;
		const user = await this.usersRepo.findOne({ idx });

		if (!user) {
			throw new UnauthorizedException('User not found');
		}

		done(null, user);
	}
}
