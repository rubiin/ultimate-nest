import { IProfileData } from "@common/@types";
import { BaseRepository } from "@common/database";
import { User } from "@entities";
import { AutoPath } from "@mikro-orm/core/typings";
import { InjectRepository } from "@mikro-orm/nestjs";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { I18nContext } from "nestjs-i18n";
import { from, map, Observable, switchMap } from "rxjs";

@Injectable()
export class ProfileService {
	constructor(
		@InjectRepository(User)
		private userRepository: BaseRepository<User>,
	) {}

	/**
	 * "Get a user by their username, and populate the specified fields."
	 *
	 * The first parameter is the username, which is a string. The second parameter is an array of fields
	 * to populate
	 * @param {string} username - string - The username of the user to get.
	 * @param {AutoPath<User, keyof User>[]} populate - AutoPath<User, keyof User>[] = []
	 * @returns Observable<User>
	 */
	getProfileByUsername(
		username: string,
		populate: AutoPath<User, keyof User>[] = [],
	): Observable<User> {
		return from(
			this.userRepository.findOne(
				{
					username,
					isActive: true,
					isObsolete: false,
				},
				{
					populate,
					populateWhere: {
						favorites: { isActive: true, isObsolete: false },
						followers: { isActive: true, isObsolete: false },
						followed: { isActive: true, isObsolete: false },
						posts: { isActive: true, isObsolete: false },
					},
				},
			),
		).pipe(
			map(user => {
				if (!user) {
					throw new NotFoundException(
						I18nContext.current<I18nTranslations>()!.t("exception.itemDoesNotExist", {
							args: { item: "Profile" },
						}),
					);
				}

				return user;
			}),
		);
	}

	/**
	 * It takes a logged in user and a username to follow, and returns an observable of the profile data
	 * of the user that was followed
	 * @param {User} loggedInUser - User - The user that is currently logged in.
	 * @param {string} usernameToFollow - The username of the user to follow.
	 * @returns A profile object with the following properties:
	 *    following: true,
	 *    avatar: followingUser.avatar,
	 *    username: followingUser.username
	 */
	follow(loggedInUser: User, usernameToFollow: string): Observable<IProfileData> {
		if (!usernameToFollow) {
			throw new BadRequestException(
				I18nContext.current<I18nTranslations>()!.t("exception.usernameRequired"),
			);
		}

		return this.getProfileByUsername(usernameToFollow, ["followers"]).pipe(
			switchMap(followingUser => {
				if (loggedInUser.username === usernameToFollow) {
					throw new BadRequestException(
						I18nContext.current<I18nTranslations>()!.t(
							"exception.followerFollowingSame",
						),
					);
				}

				followingUser.followers.add(loggedInUser);

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
	 * It removes the logged in user from the followers of the user with the given username
	 * @param {User} loggedInUser - User - The user who is logged in and is trying to follow another user.
	 * @param {string} username - The username of the user to follow.
	 * @returns A profile object with the following properties:
	 * - following: boolean
	 * - avatar: string
	 * - username: string
	 */
	unFollow(loggedInUser: User, username: string): Observable<IProfileData> {
		if (!username) {
			throw new BadRequestException(
				I18nContext.current<I18nTranslations>()!.t("exception.usernameRequired"),
			);
		}

		return this.getProfileByUsername(username, ["followers"]).pipe(
			switchMap(followingUser => {
				const followerUser = this.userRepository.getReference(loggedInUser.id);

				if (followingUser.id === loggedInUser.id) {
					throw new BadRequestException(
						I18nContext.current<I18nTranslations>()!.t(
							"exception.followerFollowingSame",
						),
					);
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
}
