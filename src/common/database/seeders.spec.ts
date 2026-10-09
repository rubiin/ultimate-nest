import { existsSync } from "node:fs";
import { join } from "node:path";

import { createMock } from "@golevelup/ts-vitest";
import { Protocol, User } from "@entities";
import { EntityManager } from "@mikro-orm/postgresql";

import { baseOptions } from "./orm.config";
import { FixtureSeeder } from "./seeders/fixture.seeder";

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
});
