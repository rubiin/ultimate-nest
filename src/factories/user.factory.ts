import { User } from '../entities/user.entity';
import { Factory, Faker } from '@mikro-orm/seeder';

export class UserFactory extends Factory<User> {
	model = User;

	definition(faker: Faker): Partial<User> {
		return {
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
		};
	}
}
