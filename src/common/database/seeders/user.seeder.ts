import type { EntityManager } from "@mikro-orm/core";
import { Seeder, faker } from "@mikro-orm/seeder";
import { randomNumber } from "helper-fns";
import { PostFactory, UserFactory } from "../factories";

/**
 * Runs the UserSeeder, creating new users with associated posts, comments, and tags.
 * @param em - The EntityManager instance to use for database operations.
 * @returns A Promise that resolves when the seeder has finished running.
 */

export class UserSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    new UserFactory(em)
      .each(async (user) => {
        const posts = await new PostFactory(em).create(randomNumber(2, 4), {
          author: user,
          comments: [
            {
              body: faker.lorem.words(randomNumber(4, 8)),
            },
            {
              body: faker.lorem.words(randomNumber(4, 8)),
            },
          ],
          tags: [
            {
              title: faker.system.fileName() + Date.now(),
              description: faker.lorem.sentence(1),
            },
            {
              title: faker.system.fileName() + Date.now(),
              description: faker.lorem.sentence(1),
            },
          ],
        });

        user.posts.set(posts);
      })
      .make(50);
  }
}
