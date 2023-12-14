import process from "node:process";
import chalk from "chalk";
import type { EntityManager } from "@mikro-orm/postgresql";
import { Seeder } from "@mikro-orm/seeder";
import { Logger } from "@nestjs/common";
import { UserSeeder } from "./user.seeder";
import { AdminSeeder } from "./admin.seeder";

/*
* It calls the AdminSeeder and UserSeeder classes
*/
export class DatabaseSeeder extends Seeder {
  public logger = new Logger("DatabaseSeeder");

  async run(em: EntityManager): Promise<void> {
    const seeders = [AdminSeeder, UserSeeder];

    this.logger.log(
            `Seeding database with seeders: ${chalk.green(seeders.map(s => s.name).join(", "))}`,
    );

    this.logger.log(`User password is set as : ${chalk.green(process.env.USER_PASSWORD)}`);

    return this.call(em, seeders);
  }
}
