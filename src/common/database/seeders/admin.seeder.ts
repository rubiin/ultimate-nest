import { AppRoles } from "@common/constants/app.roles";
import type { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import { UserFactory } from "../factories/user.factory";

export class AdminSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		await new UserFactory(em).createOne({
			email: "roobin.bhandari@gmail.com",
			password: process.env.USER_PASSWORD,
			firstName: "Rubin",
			lastName: "Bhandari",
			roles: [AppRoles.ADMIN],
		});
	}
}
