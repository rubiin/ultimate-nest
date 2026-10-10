import { EntityManager } from "@mikro-orm/postgresql";
import { Seeder } from "@mikro-orm/seeder";
import { Logger } from "@nestjs/common";
import chalk from "chalk";

import { AdminSeeder } from "./admin.seeder";
import { FixtureSeeder } from "./fixture.seeder";
import { UserSeeder } from "./user.seeder";

/*
 * It calls the AdminSeeder, FixtureSeeder and UserSeeder classes
 */
export class DatabaseSeeder extends Seeder {
  public logger = new Logger("DatabaseSeeder");

  async run(em: EntityManager): Promise<void> {
    const seeders = [AdminSeeder, FixtureSeeder, UserSeeder];

    this.logger.log(
      `Seeding database with seeders: ${chalk.green(seeders.map((s) => s.name).join(", "))}`,
    );

    return this.call(em, seeders);
  }
}
