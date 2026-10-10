import { MikroORM, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";

import * as entities from "../entities";

describe("full entity schema", () => {
  let orm: MikroORM;
  let sql: string;

  beforeAll(async () => {
    orm = await MikroORM.init({
      connect: false,
      dbName: "schema_spec",
      driver: PostgreSqlDriver,
      entities: Object.values(entities).filter((e) => typeof e === "function") as never,
      metadataCache: { enabled: false },
      metadataProvider: TsMorphMetadataProvider,
    });
    sql = await orm.schema.getCreateSchemaSQL();
  }, 60_000);

  afterAll(async () => orm?.close());

  it("names every constraint exactly once", () => {
    const names = [...sql.matchAll(/add constraint "([^"]+)"/g)].map((match) => match[1]);
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);

    expect(duplicates).toEqual([]);
  });

  it("keeps both the non-empty and the enum check on user.roles", () => {
    expect(sql).toContain("check (cardinality(roles) > 0)");
    expect(sql).toContain(`check ("roles" <@ array['ADMIN'::text, 'AUTHOR'::text])`);
  });
});
