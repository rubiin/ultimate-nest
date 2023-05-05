import { Tag } from "@entities";
import { Factory, Faker } from "@mikro-orm/seeder";

/* `TagFactory` is a factory that creates `Tag` instances */
export class TagFactory extends Factory<Tag> {
	model = Tag;

	count = 0;

	definition(faker: Faker): Partial<Tag> {
		return {
			title: faker.helpers.unique(faker.system.fileName) + faker.datatype.number(100),
			description: faker.lorem.sentence(1),
		};
	}
}
