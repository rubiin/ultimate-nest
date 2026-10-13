import { ApiProperty } from "@nestjs/swagger";
import { Validator } from "class-validator";

import { CursorMeta, CursorPaginationResponse } from "./cursor.response";

type ApiPropertyOptions = { type?: unknown; isArray?: boolean };

const swaggerOptionsOf = (target: object, key: string) =>
  Reflect.getMetadata("swagger/apiModelProperties", target, key) as ApiPropertyOptions;

describe("CursorPaginationResponse", () => {
  const validator = new Validator();

  class Response extends CursorPaginationResponse<string> {
    constructor() {
      super();
      this.data = ["a"];
      this.meta = { hasNextPage: false, hasPreviousPage: false, nextCursor: "cursor" };
    }
  }

  it("declares data as an array and meta with a lazy type reference", () => {
    expect(swaggerOptionsOf(Response.prototype, "data")).toMatchObject({ isArray: true });
    expect(swaggerOptionsOf(Response.prototype, "meta")?.type).toBeTypeOf("function");
  });

  // Regression: the meta type used to be resolved eagerly, which crashed when the swagger
  // document was built before the class was fully defined.
  it("resolves the meta type lazily to CursorMeta", () => {
    const type = swaggerOptionsOf(Response.prototype, "meta")?.type as () => unknown;

    expect(type()).toBe(CursorMeta);
  });

  it("validates data as an array", async () => {
    await expect(validator.validate(new Response())).resolves.toHaveLength(0);

    const invalid = new Response();
    invalid.data = "not-an-array" as unknown as string[];

    expect(await validator.validate(invalid)).toHaveLength(1);
  });
});

describe("ApiProperty", () => {
  it("stays importable for the lazy type reference above", () => {
    expect(ApiProperty).toBeTypeOf("function");
  });
});
