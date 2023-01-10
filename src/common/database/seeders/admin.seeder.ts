import { Roles } from "@common/types/enums/permission.enum";
import type { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";

import { UserFactory } from "../factories/user.factory";

/* It creates a user with the email and password specified in the .env file, and gives them the admin
role */
export class AdminSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		await new UserFactory(em).create(1, {
			email: "roobin.bhandari@gmail.com",
			password: process.env.USER_PASSWORD,
			firstName: "Rubin",
			lastName: "Bhandari",
			roles: [Roles.ADMIN],
		});
	}
}
