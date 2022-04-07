import { Post } from "../entities/post.entity";
import { Factory, Faker } from "@mikro-orm/seeder";
import { randomNumber } from "@rubiin/js-utils";

export class PostFactory extends Factory<Post> {
	model = Post;

	definition(faker: Faker): Partial<Post> {
		return {
			title: faker.lorem.words(randomNumber(1, 10)),
			content: faker.lorem.paragraph(randomNumber(2, 4)),
			category: faker.lorem.word(),
			slug: faker.lorem.slug(),
			tags: faker.lorem.words(randomNumber(1, 4)).split(" "),
		};
	}
}
