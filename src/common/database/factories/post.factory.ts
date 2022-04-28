import { Post } from "../../../entities/post.entity";
import { Factory, Faker } from "@mikro-orm/seeder";
import { randomNumber, slugify } from "helper-fns";

export class PostFactory extends Factory<Post> {
	model = Post;

	definition(faker: Faker): Partial<Post> {
		const title = faker.lorem.words(randomNumber(1, 10));
		return {
			title,
			slug: slugify(title),
			content: faker.lorem.paragraph(randomNumber(2, 4)),
			tags: faker.lorem.words(randomNumber(1, 4)).split(" "),
		};
	}
}
