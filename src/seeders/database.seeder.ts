import { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import { PostFactory } from "../factories/post.factory";
import { UserFactory } from "../factories/user.factory";

export class DatabaseSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		new UserFactory(em)
			.each(user => {
				const posts = new PostFactory(em).make(5, { author: user });

				user.articles.set(posts);
			})
			.make(5);
	}
}
