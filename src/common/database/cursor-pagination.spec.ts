import { QueryOrder } from "@common/@types";
import { LoadStrategy, MikroORM, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";

import * as entities from "../../entities";
import { User } from "../../entities";
import { BaseRepository } from "./base.repository";

/**
 * Probes the SQL `cursorPagination` issues. There is no live database here: the
 * connection is replaced with one that records the generated SQL instead of running it.
 */
describe("cursorPagination queries", () => {
  let orm: MikroORM;
  const queries: string[] = [];
  let rows: object[] = [];
  const options = {
    cursor: "username" as const,
    fields: [],
    first: 2,
    order: QueryOrder.ASC,
    relations: [],
    searchField: "firstName" as const,
    withDeleted: false,
  };
  const paginate = (overrides: object = {}) =>
    new BaseRepository(orm.em.fork(), User).cursorPagination({ ...options, ...overrides });

  beforeAll(async () => {
    orm = await MikroORM.init({
      allowGlobalContext: true,
      connect: false,
      dbName: "cursor_pagination_probe",
      driver: PostgreSqlDriver,
      entities: Object.values(entities).filter((value) => typeof value === "function") as never,
      loadStrategy: LoadStrategy.BALANCED,
      metadataCache: { enabled: false },
      metadataProvider: TsMorphMetadataProvider,
    });

    Object.assign(orm.em.getConnection(), {
      execute: async (query: string | { sql: string }) => {
        queries.push(typeof query === "string" ? query : query.sql);

        return rows;
      },
    });
  }, 60_000);

  afterAll(async () => orm?.close());

  beforeEach(() => {
    queries.length = 0;
    rows = [];
  });

  it("should fetch a page with a single query and no count", async () => {
    rows = [
      { id: 1, username: "a" },
      { id: 2, username: "b" },
      { id: 3, username: "c" },
    ];

    const result = await paginate({ search: "jo" });

    expect(queries).toHaveLength(1);
    expect(queries[0]).not.toMatch(/count\(/i);
    expect(queries[0]).toMatch(/"u0"\."first_name" ilike \?/);
    expect(queries[0]).toMatch(/"u0"\."is_deleted" = \?/);
    expect(queries[0]).toMatch(/order by "u0"\."username" asc limit \?/);
    expect(result.data.map((user) => user.username)).toEqual(["a", "b"]);
    expect(result.meta).toMatchObject({ hasNextPage: true, hasPreviousPage: false });
  });

  it("should continue after the returned cursor", async () => {
    rows = [
      { id: 1, username: "a" },
      { id: 2, username: "b" },
      { id: 3, username: "c" },
    ];
    const { meta } = await paginate();

    queries.length = 0;
    rows = [{ id: 3, username: "c" }];

    const result = await paginate({ after: meta.nextCursor });

    expect(queries).toHaveLength(1);
    expect(queries[0]).toMatch(/"u0"\."username" > \?/);
    expect(result.data.map((user) => user.username)).toEqual(["c"]);
    expect(result.meta).toMatchObject({ hasNextPage: false, hasPreviousPage: true });
  });

  it("should include soft-deleted rows when withDeleted is set", async () => {
    await paginate({ withDeleted: true });

    expect(queries[0]).not.toMatch(/"u0"\."is_deleted" = \?/);
  });
});
