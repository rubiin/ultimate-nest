import { NotFoundException } from "@nestjs/common";

import { baseOptions } from "./orm.config";

describe("baseOptions", () => {
  describe("findOneOrFailHandler", () => {
    it("turns a missing row into a 404 naming the entity and key", () => {
      const exception = baseOptions.findOneOrFailHandler("Post", "post-id");

      expect(exception).toBeInstanceOf(NotFoundException);
      expect(exception.message).toBe("Post not found for post-id");
    });
  });

  describe("migrations.fileName", () => {
    it("appends the migration name when the CLI supplies one", () => {
      expect(baseOptions.migrations.fileName("1700000000000", "add_posts")).toBe(
        "Migration1700000000000_add_posts",
      );
    });

    it("falls back to the timestamp alone when no name is given", () => {
      // Regression: the CLI passes `undefined`, not `null`, for an unnamed migration.
      expect(baseOptions.migrations.fileName("1700000000000")).toBe("Migration1700000000000");
    });
  });
});
