import { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import { randomNumber } from "helper-fns";

import { CommentFactory, PostFactory, UserFactory } from "../factories";

/*
It creates a post, a user, and a comment
*/
export class UserSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		new UserFactory(em)
			.each(async user => {
				const comment = new CommentFactory(em).make(randomNumber(2, 4), {
					author: user,
				});

				const posts = await new PostFactory(em).create(randomNumber(2, 4), {
					author: user,
					comments: comment,
				});

				user.posts.set(posts);
			})
			.make(randomNumber(2, 5));
	}
}
