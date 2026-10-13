import { plainToInstance } from "class-transformer";

import { Sanitize, ToBoolean, Trim } from "./transform.decorator";

describe("Trim", () => {
  class Dto {
    @Trim()
    name!: string;

    @Trim()
    names!: string[];
  }

  it("trims a string and collapses repeated spaces", () => {
    expect(plainToInstance(Dto, { name: "  hello   world  " }).name).toBe("hello world");
  });

  it("trims every element of an array", () => {
    expect(plainToInstance(Dto, { names: ["  a  b ", " c"] }).names).toEqual(["a b", "c"]);
  });
});

describe("ToBoolean", () => {
  class Dto {
    @ToBoolean()
    flag!: unknown;
  }

  it("maps the string literals", () => {
    expect(plainToInstance(Dto, { flag: "true" }).flag).toBe(true);
    expect(plainToInstance(Dto, { flag: "false" }).flag).toBe(false);
  });

  it("passes a value that is already a boolean through", () => {
    expect(plainToInstance(Dto, { flag: true }).flag).toBe(true);
  });
});

describe("Sanitize", () => {
  class Dto {
    @Sanitize()
    body!: unknown;

    @Sanitize()
    items!: unknown[];
  }

  it("strips markup from a string", () => {
    expect(plainToInstance(Dto, { body: "hi<script>alert(1)</script>" }).body).toBe("hi");
  });

  it("sanitizes string elements of an array and keeps the rest", () => {
    expect(plainToInstance(Dto, { items: ["hi<script>x</script>", 7, "plain"] }).items).toEqual([
      "hi",
      7,
      "plain",
    ]);
  });

  it("returns a non-string value untouched", () => {
    expect(plainToInstance(Dto, { body: 7 }).body).toBe(7);
    expect(plainToInstance(Dto, { body: null }).body).toBeNull();
  });
});
