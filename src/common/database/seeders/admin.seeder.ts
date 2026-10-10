import process from "node:process";

import { Roles } from "@common/@types";
import { EntityManager } from "@mikro-orm/postgresql";
import { Seeder } from "@mikro-orm/seeder";
import { normalizeEmail } from "helper-fns";

import { UserFactory } from "../factories";

/*
 * It creates a user with the email and password specified in the .env file, and gives them the admin role
 */
export class AdminSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    await new UserFactory(em).createOne({
      // Login normalizes the email (`IsEmailField`), which drops the dots of a gmail address.
      email: normalizeEmail("roobin.bhandari@gmail.com"),
      password: process.env.USER_PASSWORD,
      firstName: "Rubin",
      lastName: "Bhandari",
      roles: [Roles.ADMIN],
    });
  }
}
