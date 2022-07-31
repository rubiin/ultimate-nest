import { Post } from "../../../entities/post.entity";
import { Factory, Faker } from "@mikro-orm/seeder";
import { randomNumber, slugify } from "helper-fns";

/* `PostFactory` is a factory that creates `Post` instances */
export class PostFactory extends Factory<Post> {
	model = Post;

	definition(faker: Faker): Partial<Post> {
		const title = faker.lorem.words(randomNumber(1, 10));

		return {
			title,
			slug: slugify(title),
			content: faker.lorem.paragraph(randomNumber(2, 4)),
			description: faker.lorem.words(randomNumber(10, 20)),
			tags: faker.lorem.words(randomNumber(1, 4)).split(" "),
		};
	}
}
