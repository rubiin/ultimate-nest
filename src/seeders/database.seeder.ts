import { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";

export class DatabaseSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		return this.call(em, []);
	}
}
