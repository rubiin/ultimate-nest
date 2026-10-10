import { existsSync } from "node:fs";
import { join } from "node:path";

import { createMock } from "@golevelup/ts-vitest";
import { Post, Protocol, User } from "@entities";
import { EntityManager } from "@mikro-orm/postgresql";
import { normalizeEmail } from "helper-fns";

import { baseOptions } from "./orm.config";
import { AdminSeeder } from "./seeders/admin.seeder";
import { FixtureSeeder } from "./seeders/fixture.seeder";
import { UserSeeder } from "./seeders/user.seeder";

interface PostData {
  comments: { author?: unknown }[];
  tags: { title: string }[];
}

/** A mocked em whose `create` hands the data back, with a `posts` collection on users. */
const recordingEm = () => {
  const em = createMock<EntityManager>();
  em.create.mockImplementation(((entity: unknown, data: object) =>
    entity === User ? { ...data, posts: { set: vi.fn<() => void>() } } : data) as never);
  em.flush.mockResolvedValue(undefined);

  return em;
};

const createdData = <T>(em: ReturnType<typeof recordingEm>, model: unknown) =>
  em.create.mock.calls.filter(([entity]) => entity === model).map(([, data]) => data as T);

// Specs live outside `seeders/`: the seeder glob would otherwise load them as seeders.
describe("database seeders", () => {
  // Regression: the path pointed at `./seeders`, which does not exist, so `seeder:run` found nothing.
  it("points the seeder path at the seeders folder", () => {
    expect(existsSync(join(baseOptions.seeder.path, "database.seeder.ts"))).toBe(true);
  });

  it("seeds the fixture accounts and a protocol row", async () => {
    const em = createMock<EntityManager>();
    em.create.mockImplementation(((_entity: unknown, data: object) => data) as never);

    await new FixtureSeeder().run(em);

    const created = em.create.mock.calls.map(([entity, data]) => [
      entity,
      (data as { email?: string }).email,
    ]);
    expect(created).toStrictEqual([
      [User, "user@gmail.com"],
      [User, "twofa@gmail.com"],
      [Protocol, undefined],
    ]);
  });

  // Regression: one shared `create(n, input)` gave every post of a user the same tags, and the
  // small falso pools collided across users, breaking the unique tag title.
  it("gives every seeded tag a distinct title", async () => {
    const em = recordingEm();

    await new UserSeeder().run(em);

    const titles = createdData<PostData>(em, Post).flatMap((post) =>
      post.tags.map((tag) => tag.title),
    );
    expect(titles.length).toBeGreaterThan(0);
    expect(new Set(titles).size).toBe(titles.length);
  });

  // Regression: seeded comments had no author, which the NOT NULL column rejects.
  it("gives every seeded comment an author", async () => {
    const em = recordingEm();

    await new UserSeeder().run(em);

    const comments = createdData<PostData>(em, Post).flatMap((post) => post.comments);
    expect(comments.length).toBeGreaterThan(0);
    expect(comments.every((comment) => comment.author !== undefined)).toBe(true);
  });

  // Regression: login normalizes the email, so the dotted gmail address could never log in.
  it("seeds the admin with the email login normalizes to", async () => {
    const em = recordingEm();

    await new AdminSeeder().run(em);

    const [admin] = createdData<{ email: string }>(em, User);
    expect(admin!.email).toBe(normalizeEmail("roobin.bhandari@gmail.com"));
    expect(admin!.email).not.toBe("roobin.bhandari@gmail.com");
  });
});
