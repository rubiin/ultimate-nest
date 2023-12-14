import type { EntityManager } from "@mikro-orm/postgresql";
import { Seeder } from "@mikro-orm/seeder";
import { randomNumber } from "helper-fns";
import { randAddress, randAmericanFootballTeam, randCatchPhrase } from "@ngneat/falso";
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
              body: randCatchPhrase(),
            },
            {
              body: randCatchPhrase(),
            },
          ],
          tags: [
            {
              title: randAmericanFootballTeam(),
              description: randCatchPhrase(),
            },
            {
              title: randAddress().street,
              description: randCatchPhrase(),
            },
          ],
        });

        user.posts.set(posts);
      })
      .make(50);
  }
}
