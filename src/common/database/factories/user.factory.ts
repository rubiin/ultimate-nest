import process from "node:process";

import { Roles } from "@common/@types";
import { User } from "@entities";
import { Factory } from "@mikro-orm/seeder";
import {
  randCatchPhrase,
  randEmail,
  randFirstName,
  randFutureDate,
  randLastName,
  randUrl,
  randUserName,
} from "@ngneat/falso";
import { randomAvatar } from "helper-fns";

/* `UserFactory` is a factory that creates `User` instances */
export class UserFactory extends Factory<User> {
  model = User;

  definition(): Partial<User> {
    return {
      avatar: randomAvatar(),
      bio: randCatchPhrase(),
      email: randEmail(),
      firstName: randFirstName(),
      lastLogin: randFutureDate({ years: 1 }),
      lastName: randLastName(),
      middleName: randFirstName(),
      password: process.env.USER_PASSWORD,
      roles: [Roles.AUTHOR],
      social: {
        facebook: randUrl(),
        linkedin: randUrl(),
        twitter: randUrl(),
      },
      username: randUserName(),
    };
  }
}
