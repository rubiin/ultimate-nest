import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { User } from '../entities/user.entity';
import faker from 'minifaker';

export class UserSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		const author = em.create(User, {
			firstName: faker.firstName(),
			middleName: faker.firstName(),
			lastName: faker.lastName(),
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
