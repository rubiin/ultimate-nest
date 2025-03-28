import  { EntityManager } from "@mikro-orm/postgresql"
import process from "node:process"
import { Roles } from "@common/@types"
import { Seeder } from "@mikro-orm/seeder"
import { UserFactory } from "../factories"

/*
* It creates a user with the email and password specified in the .env file, and gives them the admin role
*/
export class AdminSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    await new UserFactory(em).createOne({
      email: "roobin.bhandari@gmail.com",
      password: process.env.USER_PASSWORD,
      firstName: "Rubin",
      lastName: "Bhandari",
      roles: [Roles.ADMIN],
    })
  }
}
