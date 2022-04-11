import { User } from "../../../entities/user.entity";
import { Factory, Faker } from "@mikro-orm/seeder";
import { AppRoles } from "@common/constants/app.roles";

export class UserFactory extends Factory<User> {
	model = User;

	definition(faker: Faker): Partial<User> {
		return {
			firstName: faker.name.firstName(),
			lastName: faker.name.firstName(),
			avatar: faker.image.avatar(),
			email: faker.internet.email(),
			roles: [AppRoles.AUTHOR],
			password: faker.internet.password(
				9,
				false,
				/(!|\?|&|\[|]|%|\$|[\dA-Za-z])/,
			),
		};
	}
}
