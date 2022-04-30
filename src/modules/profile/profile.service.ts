import { BaseRepository } from "@common/database/base.repository";
import { IProfileData } from "@common/interfaces/followers.interface";
import { User } from "@entities";
import { MikroORM } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { BadRequestException, Injectable } from "@nestjs/common";
import { Observable, from, switchMap, map, forkJoin } from "rxjs";

@Injectable()
export class ProfileService {
	constructor(
		@InjectRepository(User)
		private userRepository: BaseRepository<User>,
		private readonly orm: MikroORM,
	) {}

	follow(followerEmail: string, username: string): Observable<IProfileData> {
		if (!followerEmail || !username) {
			throw new BadRequestException(
				"Follower email and username not provided.",
			);
		}

		const followingUser$ = from(
			this.userRepository.findOne(
				{ username, isObsolete: false, isActive: true },
				{
					populate: ["followers"],
				},
			),
		);

		const followerUser$ = from(
			this.userRepository.findOne({
				email: followerEmail,
				isObsolete: false,
				isActive: true,
			}),
		);

		return forkJoin([followerUser$, followingUser$]).pipe(
			switchMap(([followerUser, followingUser]) => {
				if (followingUser.email === followerEmail) {
					throw new BadRequestException(
						"FollowerEmail and FollowingId cannot be equal.",
					);
				}

				followingUser.followers.add(followerUser);

				const profile: IProfileData = {
					following: true,
					avatar: followingUser.avatar,
					username: followingUser.username,
				};

				return from(this.userRepository.flush()).pipe(
					map(() => profile),
				);
			}),
		);
	}

	unFollow(followerId: number, username: string): Observable<IProfileData> {
		if (!followerId || !username) {
			throw new BadRequestException(
				"FollowerId and username not provided.",
			);
		}

		const followingUser$ = from(
			this.userRepository.findOne(
				{ username, isObsolete: false, isActive: true },
				{
					populate: ["followers"],
				},
			),
		);

		return followingUser$.pipe(
			switchMap(followingUser => {
				const followerUser =
					this.userRepository.getReference(followerId);

				if (followingUser.id === followerId) {
					throw new BadRequestException(
						"FollowerId and FollowingId cannot be equal.",
					);
				}

				followingUser.followers.remove(followerUser);

				const profile: IProfileData = {
					following: false,
					avatar: followingUser.avatar,
					username: followingUser.username,
				};

				return from(this.userRepository.flush()).pipe(
					map(() => profile),
				);
			}),
		);
	}

	profile(email: string): Observable<User> {
		const profile$ = from(
			this.userRepository.findOne(
				{ email, isObsolete: false, isActive: true },
				{ populate: ["articles"] },
			),
		);

		return profile$.pipe(map(user => user));
	}
}
