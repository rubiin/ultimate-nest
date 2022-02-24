import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { User } from '../entities/user.entity';
import { Faker } from '@mikro-orm/seeder';

export class UserSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		const faker = new Faker();
		const author = em.create(User, {
			fullName: faker.name.firstName(),
			bio: faker.hacker.phrase(),
			username: faker.internet.userName(),
			website: faker.internet.url(),
			avatar: faker.image.avatar(),
			email: faker.internet.email(),
			password: faker.internet.password(
				9,
				false,
				/(!|\?|&|\[|]|%|\$|[\dA-Za-z])/,
			),
		});

		em.persist(author);
	}
}
