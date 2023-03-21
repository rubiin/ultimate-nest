import { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import { randomNumber } from "helper-fns";

import { CommentFactory, PostFactory, TagFactory, UserFactory } from "../factories";

/*
 * It creates a post, a user and a comment
 */
export class UserSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		new UserFactory(em)
			.each(async user => {
				const comments = new CommentFactory(em).make(randomNumber(2, 4), {
					author: user,
				});

				const tags = new TagFactory(em).make(randomNumber(2, 4));

				const posts = await new PostFactory(em).create(randomNumber(2, 4), {
					author: user,
					comments,
					tags: tags,
				});

				user.posts.set(posts);
			})
			.make(randomNumber(2, 5));
	}
}
