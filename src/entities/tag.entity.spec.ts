import { Tag } from "@entities";

describe("tag entity", () => {
  describe("generateSlug", () => {
    it("should slugify the title when the title changes", () => {
      const tag = new Tag({ title: "Hello World" });

      tag.generateSlug({
        changeSet: { payload: { title: "Hello World" } },
      } as never);

      expect(tag.slug).toEqual("hello-world");
    });

    it("should do nothing when the title is not in the change set", () => {
      const tag = new Tag({ slug: "existing", title: "Hello World" });

      tag.generateSlug({ changeSet: { payload: {} } } as never);

      expect(tag.slug).toEqual("existing");
    });

    it("should do nothing when there is no change set", () => {
      const tag = new Tag({ slug: "existing", title: "Hello World" });

      tag.generateSlug({} as never);

      expect(tag.slug).toEqual("existing");
    });

    it("should handle punctuation in the title", () => {
      const tag = new Tag({ title: "Hello, World & Friends!" });

      tag.generateSlug({ changeSet: { payload: { title: tag.title } } } as never);

      expect(tag.slug).toEqual("hello-world-friends");
    });
  });
});
