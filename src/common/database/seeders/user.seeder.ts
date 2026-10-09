import { EntityManager } from "@mikro-orm/postgresql";
import { Seeder } from "@mikro-orm/seeder";
import { randAddress, randAmericanFootballTeam, randCatchPhrase, randUuid } from "@ngneat/falso";
import { randomNumber } from "helper-fns";

import { PostFactory, UserFactory } from "../factories";

/** Tag titles are unique, and the falso pools are small enough to collide across 50 users. */
const uniqueTitle = (title: string) => `${title} ${randUuid().slice(0, 8)}`;

/**
 * Runs the UserSeeder, creating new users with associated posts, comments, and tags.
 * Everything is only persisted here; `Seeder.call` flushes once the seeder returns.
 * @param em - The EntityManager instance to use for database operations.
 */

export class UserSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    new UserFactory(em)
      .each((user) => {
        // One `makeOne` per post: a shared `make(n, input)` would give every post the same tags.
        const posts = Array.from({ length: randomNumber(2, 4) }, () =>
          new PostFactory(em).makeOne({
            author: user,
            comments: [
              {
                body: randCatchPhrase(),
                author: user,
              },
              {
                body: randCatchPhrase(),
                author: user,
              },
            ],
            tags: [
              {
                title: uniqueTitle(randAmericanFootballTeam()),
                description: randCatchPhrase(),
              },
              {
                title: uniqueTitle(randAddress().street),
                description: randCatchPhrase(),
              },
            ],
          }),
        );

        user.posts.set(posts);
      })
      .make(50);
  }
}
