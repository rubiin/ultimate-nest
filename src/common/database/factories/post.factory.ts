import { Post } from "@entities";
import { Factory, Faker } from "@mikro-orm/seeder";
import { randomNumber } from "helper-fns";

/* `PostFactory` is a factory that creates `Post` instances */
export class PostFactory extends Factory<Post> {
	model = Post;

	definition(faker: Faker): Partial<Post> {
		return {
			title: faker.music.songName() + Date.now(),
			content: faker.lorem.sentence(randomNumber(2, 4)),
			description: faker.lorem.words(randomNumber(10, 20)),
			readingTime: randomNumber(10, 100),
			favoritesCount: randomNumber(1, 100),
			readCount: randomNumber(10, 100),
		};
	}
}
