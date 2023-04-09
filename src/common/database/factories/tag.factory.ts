import { Tag } from "@entities";
import { Factory, Faker } from "@mikro-orm/seeder";

/* `TagFactory` is a factory that creates `Tag` instances */
export class TagFactory extends Factory<Tag> {
	model = Tag;

	definition(faker: Faker): Partial<Tag> {
		return {
			title: faker.lorem.words(1),
			description: faker.lorem.paragraphs(1),
		};
	}
}
