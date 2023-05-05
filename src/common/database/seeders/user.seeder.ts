import { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import { randomNumber } from "helper-fns";

import { CommentFactory, PostFactory, TagFactory, UserFactory } from "../factories";

/**
 * Runs the UserSeeder, creating new users with associated posts, comments, and tags.
 *
 * @param em - The EntityManager instance to use for database operations.
 * @returns A Promise that resolves when the seeder has finished running.
 */

export class UserSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		new UserFactory(em)
			.each(async user => {
				const comments = new CommentFactory(em).make(randomNumber(2, 4), {
					author: user,
				});

				const tags = new TagFactory(em).makeOne();

				const posts = await new PostFactory(em).create(randomNumber(2, 4), {
					author: user,
					comments,
					tags: tags,
				});

				user.posts.set(posts);
			})
			.make(50);
	}
}
