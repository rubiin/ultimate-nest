import { User } from '../entities/user.entity';
import { Factory } from '@mikro-orm/seeder';
import Faker from 'minifaker';
import 'minifaker/locales/en';

export class UserFactory extends Factory<User> {
	model = User;

	definition(faker: typeof Faker): Partial<User> {
		return {
			fullName: faker.firstName(),
			bio: 'I am the author',
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
		};
	}
}
