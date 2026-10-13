import { swaggerOptions } from "./swagger.plugin";

type TagObject = { filter: (argument: (_tagObject: unknown, tag: string) => boolean) => unknown };

// Swagger's `taggedOps` is a Collection whose `filter(predicate)` is later handed the
// predicate back; the plugin wraps it so it narrows on the tag name.
const taggedOps = (tags: string[]) => {
  const collection = {
    filter: (predicate: (tagObject: unknown, tag: string) => boolean) =>
      tags.filter((tag) => predicate(undefined, tag)),
  };

  return collection as unknown as TagObject;
};

const opsFilter = () => {
  const plugin = swaggerOptions.plugins[0] as () => {
    fn: { opsFilter: (ops: TagObject, phrase: string) => unknown };
  };

  return plugin().fn.opsFilter;
};

// The plugin replaces `filter` with one that narrows on the tag name and ignores the caller's
// predicate, so the surviving tags can be read straight off the narrowed collection.
const filterTags = (tags: string[], phrase: string) => {
  const narrowed = opsFilter()(taggedOps(tags), phrase) as unknown as string[];

  return narrowed;
};

describe("swaggerOptions", () => {
  it("filters tagged operations case-insensitively", () => {
    expect(filterTags(["Posts", "Users"], "post")).toEqual(["Posts"]);
  });

  it("matches on a substring regardless of case", () => {
    expect(filterTags(["User Sessions", "Posts"], "sess")).toEqual(["User Sessions"]);
  });

  describe("operationsSorter", () => {
    const op = (method: string, path: string) => ({
      get: (key: string) => (key === "method" ? method : path),
    });

    it("orders by the HTTP verb first", () => {
      expect(swaggerOptions.operationsSorter(op("get", "/b"), op("delete", "/a"))).toBeLessThan(0);
      expect(swaggerOptions.operationsSorter(op("post", "/a"), op("get", "/b"))).toBeGreaterThan(0);
    });

    it("falls back to the path when the verbs match", () => {
      expect(swaggerOptions.operationsSorter(op("get", "/a"), op("get", "/b"))).toBeLessThan(0);
      expect(swaggerOptions.operationsSorter(op("get", "/b"), op("get", "/b"))).toBe(0);
    });
  });
});
