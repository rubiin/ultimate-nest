import { BaseRepository } from "@common/database";
import { User } from "@entities";
import { randAnimal, randCatchPhrase, randFirstName } from "@ngneat/falso";
import { randomAvatar, randomString } from "helper-fns";

/** The provider-agnostic slice of a passport OAuth profile that a `User` is built from. */
export interface OauthProfileFields {
  avatar?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

/**
 * Resolves an OAuth profile to a `User`, creating one on first sign-in.
 *
 * This is a plain function rather than a shared mixin or base class: `PassportStrategy` is
 * invoked in the `extends` clause with a different strategy name per provider ("google",
 * "facebook"), so a common superclass cannot supply it.
 */
export const resolveOauthUser = async (
  userRepo: BaseRepository<User>,
  profile: OauthProfileFields,
): Promise<User> => {
  const { avatar, email, firstName, lastName, username } = profile;

  const existingUser = await userRepo.findOne({ email });

  if (existingUser) return existingUser;

  return userRepo.create({
    avatar: avatar ?? randomAvatar(),

    bio: randCatchPhrase(),
    email,
    firstName: firstName ?? randFirstName(),
    lastName: lastName ?? randAnimal(),
    password: randomString({ length: 10, numbers: true, symbols: true }),
    username: username ?? email,
  });
};
