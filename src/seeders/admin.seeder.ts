import type { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import { User } from "../entities/user.entity";
import { Faker } from "@mikro-orm/seeder";

export class AdminSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		const faker = new Faker();
		const admin = em.create(User, {
			firstName: "Rubin",
			lastName: "Bhandari",
			email: "roobin.handari@gmail.com",
			password: "Test@1234",
			avatar: faker.image.imageUrl(),
			roles: ["ADMIN"],
		});

		em.persist(admin);
	}
}
