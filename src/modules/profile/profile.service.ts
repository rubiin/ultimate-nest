import { BaseRepository } from "@common/database/base.repository";
import { IProfileData } from "@common/types/interfaces";
import { User } from "@entities";
import { InjectRepository } from "@mikro-orm/nestjs";
import { BadRequestException, Injectable } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { forkJoin, from, map, Observable, switchMap } from "rxjs";

@Injectable()
export class ProfileService {
	constructor(
		@InjectRepository(User)
		private userRepository: BaseRepository<User>,
		private readonly i18nService: I18nService,
	) {}

	/**
	 * It takes an email and a username, finds the user with the given email and the user with the given
	 * username, adds the user with the given email to the followers of the user with the given username,
	 * and returns a profile object
	 * @param {string} followerEmail - The email of the user who is following the other user.
	 * @param {string} username - The username of the user to follow.
	 * @returns An observable of type IProfileData
	 */

	follow(followerEmail: string, username: string): Observable<IProfileData> {
		if (!followerEmail || !username) {
			throw new BadRequestException("Follower email and username not provided.");
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
						this.i18nService.t("exception.cantfollowYourself"),
					);
				}

				followingUser.followers.add(followerUser);

				const profile: IProfileData = {
					following: true,
					avatar: followingUser.avatar,
					username: followingUser.username,
				};

				return from(this.userRepository.flush()).pipe(map(() => profile));
			}),
		);
	}

	/**
	 * It takes a followerId and a username, finds the user with the given username, removes the user with
	 * the given followerId from the followers list of the user with the given username, and returns a
	 * profile object
	 * @param {number} followerId - The id of the user who is following the other user.
	 * @param {string} username - The username of the user you want to follow.
	 * @returns An observable of type IProfileData
	 */
	unFollow(followerId: number, username: string): Observable<IProfileData> {
		if (!followerId || !username) {
			throw new BadRequestException("FollowerId and username not provided.");
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
				const followerUser = this.userRepository.getReference(followerId);

				if (followingUser.id === followerId) {
					throw new BadRequestException("FollowerId and FollowingId cannot be equal.");
				}

				followingUser.followers.remove(followerUser);

				const profile: IProfileData = {
					following: false,
					avatar: followingUser.avatar,
					username: followingUser.username,
				};

				return from(this.userRepository.flush()).pipe(map(() => profile));
			}),
		);
	}

	/**
	 * It returns an observable of a user object, which is populated with posts, followed, and followers
	 * @param {string} email - string - the email of the user we want to find
	 * @returns A user object with the following properties:
	 */
	profile(email: string): Observable<User> {
		const profile$ = from(
			this.userRepository.findOne(
				{ email, isObsolete: false, isActive: true },
				{ populate: ["posts", "followed", "followers"] },
			),
		);

		return profile$.pipe(map(user => user));
	}
}
