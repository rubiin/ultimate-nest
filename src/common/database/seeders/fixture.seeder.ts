import process from "node:process";

import { Roles } from "@common/@types";
import { EntityManager } from "@mikro-orm/postgresql";
import { Seeder } from "@mikro-orm/seeder";

import { ProtocolFactory, UserFactory } from "../factories";

/*
 * Seeds the non-admin accounts the e2e fixtures log in with (`test/fixtures/user.ts`) and the
 * active `Protocol` row that `forgotPassword` reads the OTP expiry from. `twofa@gmail.com` is kept
 * apart because the 2FA spec turns two factor authentication on for it.
 */
export class FixtureSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    for (const email of ["user@gmail.com", "twofa@gmail.com"]) {
      new UserFactory(em).makeOne({
        email,
        password: process.env.USER_PASSWORD,
        roles: [Roles.AUTHOR],
      });
    }

    new ProtocolFactory(em).makeOne();
  }
}
