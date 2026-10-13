import { Post } from "@entities";
import { EventArgs, MetadataStorage } from "@mikro-orm/core";

describe("post entity", () => {
  it("should declare a version property for optimistic locking", () => {
    const meta = MetadataStorage.getMetadata("Post", "post.entity.ts", Post as never);

    expect(meta.properties.version?.version).toBe(true);
  });

  describe("generateSlug", () => {
    const changeSet = (payload: Record<string, unknown>) =>
      ({ changeSet: { payload } }) as EventArgs<Post>;

    it("should slugify the title and append a random suffix", async () => {
      const post = new Post({ title: "Hello World", content: "body" });

      await post.generateSlug(changeSet({ title: "Hello World" }));

      expect(post.slug).toMatch(/^hello-world-[a-z0-9]{1,6}$/);
      expect(post.readingTime).toBe(1);
    });

    // Regression: without the guard a re-save that omitted the title wiped the slug.
    it("should keep the existing slug when the payload has no title", async () => {
      const post = new Post({ content: "body", slug: "existing-slug" });

      await post.generateSlug(changeSet({ content: "changed" }));

      expect(post.slug).toBe("existing-slug");
    });

    it("should still recompute the reading time when there is no title", async () => {
      const post = new Post({ content: "a ".repeat(500), slug: "existing-slug" });

      await post.generateSlug(changeSet({}));

      expect(post.readingTime).toBe(2);
    });
  });

  describe("getReadingTime", () => {
    it("should count words at 250 words per minute, rounding up", () => {
      const post = new Post();

      expect(post.getReadingTime("word")).toBe(1);
      expect(post.getReadingTime("word ".repeat(250))).toBe(1);
      expect(post.getReadingTime("word ".repeat(251))).toBe(2);
    });

    it("should treat content with no words as zero", () => {
      expect(new Post().getReadingTime("")).toBe(0);
    });
  });
});
