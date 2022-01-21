import { User } from '@entities';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';

interface IProfileData {
	username: string;
	bio: string;
	image: string;
	following: boolean;
}

@Injectable()
export class ProfileService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: EntityRepository<User>,
	) {}

	async findProfile(username: string, me: User) {
		const userProfile = await this.userRepository.findOne({
			username,
			isObsolete: false,
		});

		if (!userProfile) {
			throw new NotFoundException('User does not exists or deleted');
		}

		const myReference = this.userRepository.getReference(me.id);

		const profile: IProfileData = {
			username: userProfile.username,
			bio: userProfile.bio,
			image: userProfile.avatar,
			following: userProfile.followers.contains(myReference),
		};

		return profile;
	}

	async followProfile(username: string, me: User) {
		const followingProfile = await this.userRepository.findOne(
			{
				username,
				isObsolete: false,
			},
			{ populate: ['followers'] },
		);

		if (followingProfile.username === me.username) {
			throw new BadRequestException('You cannot follow yourself');
		}

		const myReference = this.userRepository.getReference(me.id);

		if (followingProfile.followers.contains(myReference)) {
			throw new BadRequestException(
				'You are already following this user',
			);
		}

		followingProfile.followers.add(me);
		await this.userRepository.flush();

		const profile: IProfileData = {
			username: followingProfile.username,
			bio: followingProfile.bio,
			image: followingProfile.avatar,
			following: true,
		};

		return profile;
	}

	async UnFollowProfile(username: string, me: User) {
		const followingProfile = await this.userRepository.findOne(
			{
				username,
				isObsolete: false,
			},
			{ populate: ['followers'] },
		);

		const myReference = this.userRepository.getReference(me.id);

		if (!followingProfile.followers.contains(myReference)) {
			throw new BadRequestException('You are not following this user');
		}

		followingProfile.followers.remove(me);
		await this.userRepository.flush();

		const profile: IProfileData = {
			username: followingProfile.username,
			bio: followingProfile.bio,
			image: followingProfile.avatar,
			following: false,
		};

		return profile;
	}
}
