import type { AutoPath, EntityKey } from "@mikro-orm/core/typings";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager } from "@mikro-orm/postgresql";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { Observable } from "rxjs";
import { from, map, mergeMap, of, switchMap, throwError } from "rxjs";
import { itemDoesNotExistKey, translate } from "@lib/i18n";
import { User } from "@entities";
import { BaseRepository } from "@common/database";
import type { ProfileData } from "@common/@types";

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private userRepository: BaseRepository<User>,
    private readonly em: EntityManager,
  ) { }

  /**
   * "Get a user by their username, and populate the specified fields."
   *
   * The first parameter is the username, which is a string. The second parameter is an array of fields
   * to populate
   * @param username - string - The username of the user to get.
   * @param populate - AutoPath<User,EntityKey<User>>[] = []
   * @returns Observable<User>
   */
  getProfileByUsername(
    username: string,
    populate: AutoPath<User, EntityKey<User>>[] = [],
  ): Observable<User> {
    return from(
      this.userRepository.findOne(
        {
          username,
        },
        {
          populate,
          populateWhere: {
            favorites: { isActive: true, isDeleted: false },
            followers: { isActive: true, isDeleted: false },
            followed: { isActive: true, isDeleted: false },
            posts: { isActive: true, isDeleted: false },
          },
        },
      ),
    ).pipe(
      mergeMap((user) => {
        if (!user) {
          return throwError(
            () =>
              new NotFoundException(
                translate(itemDoesNotExistKey, {
                  args: { item: "Profile" },
                }),
              ),
          );
        }

        return of(user);
      }),
    );
  }

  /**
   * It takes a logged in user and a username to follow, and returns an observable of the profile data
   * of the user that was followed
   * @param loggedInUser - User - The user that is currently logged in.
   * @param usernameToFollow - The username of the user to follow.
   * @returns A profile object with the following properties:
   *    following: true,
   *    avatar: followingUser.avatar,
   *    username: followingUser.username
   */
  follow(loggedInUser: User, usernameToFollow: string): Observable<ProfileData> {
    if (!usernameToFollow) {
      return throwError(
        () => new BadRequestException(translate("exception.usernameRequired")),
      );
    }

    return this.getProfileByUsername(usernameToFollow, ["followers"]).pipe(
      switchMap((followingUser) => {
        if (loggedInUser.username === usernameToFollow) {
          return throwError(
            () => new BadRequestException(translate("exception.followerFollowingSame")),
          );
        }

        followingUser.followers.add(loggedInUser);

        const profile: ProfileData = {
          following: true,
          avatar: followingUser.avatar,
          username: followingUser.username,
        };

        return from(this.em.flush()).pipe(map(() => profile));
      }),
    );
  }

  /**
   * It removes the logged in user from the followers of the user with the given username
   * @param loggedInUser - User - The user who is logged in and is trying to follow another user.
   * @param username - The username of the user to follow.
   * @returns A profile object
   */
  unFollow(loggedInUser: User, username: string): Observable<ProfileData> {
    if (!username) {
      return throwError(
        () => new BadRequestException(translate("exception.usernameRequired")),
      );
    }

    return this.getProfileByUsername(username, ["followers"]).pipe(
      switchMap((followingUser) => {
        const followerUser = this.userRepository.getReference(loggedInUser.id);

        if (followingUser.id === loggedInUser.id) {
          return throwError(
            () => new BadRequestException(translate("exception.followerFollowingSame")),
          );
        }

        followingUser.followers.remove(followerUser);

        const profile: ProfileData = {
          following: false,
          avatar: followingUser.avatar,
          username: followingUser.username,
        };

        return from(this.em.flush()).pipe(map(() => profile));
      }),
    );
  }
}
