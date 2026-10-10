import { LoadStrategy, MikroORM, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";

import * as entities from "../../entities";
import { Post, User } from "../../entities";

/**
 * The `populateWhere` clauses in the post and profile services no longer repeat
 * `isDeleted: false`, so this test makes sure the `softDelete` filter on
 * `BaseEntity` reaches the populated relations.
 * There is no live database here: the connection is replaced with one that
 * records the generated SQL instead of running it.
 */
describe("softDelete filter on populated relations", () => {
  let orm: MikroORM;
  const queries: string[] = [];
  let calls = 0;

  beforeAll(async () => {
    orm = await MikroORM.init({
      allowGlobalContext: true,
      connect: false,
      dbName: "soft_delete_probe",
      driver: PostgreSqlDriver,
      entities: Object.values(entities).filter((value) => typeof value === "function") as never,
      loadStrategy: LoadStrategy.BALANCED,
      metadataCache: { enabled: false },
      metadataProvider: TsMorphMetadataProvider,
    });

    Object.assign(orm.em.getConnection(), {
      // The first query loads the root row so that the relation query gets issued.
      execute: async (query: string | { sql: string }) => {
        queries.push(typeof query === "string" ? query : query.sql);

        return calls++ === 0 ? [{ id: 1, idx: "a", slug: "s", username: "u" }] : [];
      },
    });
  }, 60_000);

  afterAll(async () => orm?.close());

  beforeEach(() => {
    queries.length = 0;
    calls = 0;
  });

  it.each([
    ["favorites", "p1"],
    ["followers", "u1"],
    ["followed", "u1"],
    ["posts", "p0"],
  ])("should exclude soft-deleted %s when only isActive is given", async (relation, alias) => {
    await orm.em.fork().findOne(
      User,
      { username: "u" },
      {
        populate: [relation] as never,
        populateWhere: { [relation]: { isActive: true } } as never,
      },
    );

    expect(queries.at(-1)).toContain(`"${alias}"."is_deleted" = ?`);
  });

  it("should exclude soft-deleted comments when only isActive is given", async () => {
    await orm.em
      .fork()
      .findOne(
        Post,
        { slug: "s" },
        { populate: ["comments"], populateWhere: { comments: { isActive: true } } },
      );

    expect(queries.at(-1)).toMatch(/from "comment" as "c0".*"c0"\."is_deleted" = \?/);
  });

  it("should drop the condition once the filter is disabled", async () => {
    await orm.em.fork().findOne(
      User,
      { username: "u" },
      {
        filters: { softDelete: false },
        populate: ["favorites"],
        populateWhere: { favorites: { isActive: true } },
      },
    );

    expect(queries.at(-1)).not.toContain(`"p1"."is_deleted" = ?`);
  });
});
