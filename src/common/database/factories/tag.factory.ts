import { Tag } from "@entities";
import { Factory, Faker } from "@mikro-orm/seeder";
import { randomNumber } from "helper-fns";

/* `TagFactory` is a factory that creates `Tag` instances */
export class TagFactory extends Factory<Tag> {
	model = Tag;

	definition(faker: Faker): Partial<Tag> {
		return {
			title: faker.lorem.words(randomNumber(4, 8)),
			description: faker.lorem.paragraphs(randomNumber(1, 3)),
		};
	}
}
