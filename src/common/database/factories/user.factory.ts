import process from "node:process";
import { Factory } from "@mikro-orm/seeder";
import { Roles } from "@common/@types";
import { User } from "@entities";
import { randCatchPhrase, randEmail, randFirstName, randFutureDate, randLastName, randUrl, randUserName } from "@ngneat/falso";
import { randomAvatar } from "helper-fns";

/* `UserFactory` is a factory that creates `User` instances */
export class UserFactory extends Factory<User> {
  model = User;

  definition(): Partial<User> {
    return {
      firstName: randFirstName(),
      middleName: randFirstName(),
      lastName: randLastName(),
      bio: randCatchPhrase(),
      username: randUserName(),
      avatar: randomAvatar(),
      email: randEmail(),
      roles: [Roles.AUTHOR],
      password: process.env.USER_PASSWORD,
      lastLogin: randFutureDate({ years: 1 }),
      social: {
        twitter: randUrl(),
        facebook: randUrl(),
        linkedin: randUrl(),
      },
    };
  }
}
