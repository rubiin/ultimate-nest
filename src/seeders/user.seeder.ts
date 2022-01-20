import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { User } from '../entities/user.entity';
import faker from 'minifaker';
import 'minifaker/locales/en';

export class UserSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		const author = em.create(User, {
			fullName: faker.firstName(),
			bio: faker.word({ filter: word => word.length > 5 }),
			username: faker.username(),
			website: faker.domainUrl(),
			avatar: faker.imageUrlFromPlaceholder({ width: 100 }),
			email: faker.email(),
			password: faker.password({
				minLength: 9,
				symbols: true,
				uppercases: true,
				numbers: true,
			}),
		});

		em.persist(author);
	}
}
