import { baseOptions } from "./orm.config";

describe("ormConfig", () => {
  const { fileName } = baseOptions.migrations;

  // Regression: the CLI passes `undefined` for an unnamed migration, so the `name === null`
  // check never matched and files were named `Migration<ts>_undefined`.
  it("should name an unnamed migration without a suffix", () => {
    expect(fileName("20261009173003")).toBe("Migration20261009173003");
    expect(fileName("20261009173003", undefined)).toBe("Migration20261009173003");
    expect(fileName("20261009173003", null as never)).toBe("Migration20261009173003");
  });

  it("should name a named migration with the name suffix", () => {
    expect(fileName("20261009173003", "schema_hardening")).toBe(
      "Migration20261009173003_schema_hardening",
    );
  });
});
