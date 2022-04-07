import { User } from "../entities/user.entity";
import { Factory, Faker } from "@mikro-orm/seeder";

export class UserFactory extends Factory<User> {
	model = User;

	definition(faker: Faker): Partial<User> {
		return {
			firstName: faker.name.firstName(),
			lastName: faker.name.firstName(),
			avatar: faker.image.avatar(),
			email: faker.internet.email(),
			roles: ["AUTHOR"],
			password: faker.internet.password(
				9,
				false,
				/(!|\?|&|\[|]|%|\$|[\dA-Za-z])/,
			),
		};
	}
}
