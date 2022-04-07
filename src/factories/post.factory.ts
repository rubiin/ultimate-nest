import { Post } from "../entities/post.entity";
import { Factory, Faker } from "@mikro-orm/seeder";

export class PostFactory extends Factory<Post> {
	model = Post;

	definition(faker: Faker): Partial<Post> {
		return {
			title: faker.lorem.words(10),
			content: faker.lorem.paragraph(2),
			category: faker.lorem.word(),
			slug: "test-post",
		};
	}
}
