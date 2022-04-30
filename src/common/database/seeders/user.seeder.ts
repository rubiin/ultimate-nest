import { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import { PostFactory } from "../factories/post.factory";
import { UserFactory } from "../factories/user.factory";

export class UserSeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		new UserFactory(em)
			.each(async user => {
				const posts = await new PostFactory(em).create(5, {
					author: user,
				});

				user.posts.set(posts);
			})
			.make(5);
	}
}
