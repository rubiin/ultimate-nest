import { Post } from "@entities";
import { MetadataStorage } from "@mikro-orm/core";

describe("post entity", () => {
  it("should declare a version property for optimistic locking", () => {
    const meta = MetadataStorage.getMetadata("Post", "post.entity.ts", Post as never);

    expect(meta.properties.version?.version).toBe(true);
  });
});
