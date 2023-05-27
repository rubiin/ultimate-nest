import { Roles } from "@common/@types";
import { User } from "@entities";
import { Factory, Faker } from "@mikro-orm/seeder";

/* `UserFactory` is a factory that creates `User` instances */
export class UserFactory extends Factory<User> {
	model = User;

	definition(faker: Faker): Partial<User> {
		return {
			firstName: faker.name.firstName(),
			middleName: faker.name.middleName(),
			lastName: faker.name.lastName(),
			bio: faker.lorem.paragraph(),
			username: faker.internet.userName(),
			avatar: faker.image.avatar(),
			email: faker.internet.email(),
			roles: [Roles.AUTHOR],
			password: process.env.USER_PASSWORD,
			lastLogin: faker.date.past(1, new Date()),
			social: {
				twitter: faker.internet.url(),
				facebook: faker.internet.url(),
				linkedin: faker.internet.url(),
			},
		};
	}
}
