import { Tag } from "@entities";
import { Factory, Faker } from "@mikro-orm/seeder";

/* `TagFactory` is a factory that creates `Tag` instances */
export class TagFactory extends Factory<Tag> {
	model = Tag;

	count = 0;

	definition(faker: Faker): Partial<Tag> {
		return {
			title: faker.system.fileName() + Date.now(),
			description: faker.lorem.sentence(1),
		};
	}
}
