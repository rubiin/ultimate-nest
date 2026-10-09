import { MetadataStorage } from "@mikro-orm/core";

import { BaseEntity } from "./base.entity";

describe("baseEntity", () => {
  // Read straight off the decorator metadata rather than the discovered metadata:
  // discovery is what copies this filter onto every subclass, and that needs a live ORM.
  const filters = MetadataStorage.getMetadata(
    "BaseEntity",
    "base.entity.ts",
    BaseEntity as never,
  ).filters;

  it("should declare a default-on softDelete filter", () => {
    expect(Object.keys(filters)).toContain("softDelete");
    expect(filters.softDelete?.cond).toEqual({ isDeleted: false });
    expect(filters.softDelete?.default).toBe(true);
  });

  it("should default isDeleted to false so the filter matches new rows", () => {
    const entity = new (class extends BaseEntity {})();

    expect(entity.isDeleted).toBe(false);
  });
});
