import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { User } from '../entities/user.entity';

export class UserSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		const author = em.create(User, {
			firstName: 'John',
			middleName: 'Kurt',
			lastName: 'Snow',
			email: 'snow@wall.st',
			password: 'snow@wall.st',
		});
		em.persist(author);
	}
}
