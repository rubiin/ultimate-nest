import { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import { Logger } from "@nestjs/common";

import { AdminSeeder } from "./admin.seeder";
import { UserSeeder } from "./user.seeder";

const logger = new Logger("DatabaseSeeder");

/* It calls the AdminSeeder and UserSeeder classes */
export class DatabaseSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		const seeders = [AdminSeeder, UserSeeder];

		logger.debug("Seeding database with seeders: " + seeders.map(s => s.name).join(", ") + "");
		logger.debug("User password is set as : " + process.env.USER_PASSWORD);

		return this.call(em, seeders);
	}
}
