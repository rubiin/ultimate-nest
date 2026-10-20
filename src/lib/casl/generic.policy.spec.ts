import { Action } from "@common/@types";
import { createMock } from "@golevelup/ts-vitest";

import { GenericPolicyHandler } from "./generic.policy";

describe("genericPolicyHandler", () => {
  class Post {
    constructor(public data: { id?: string } = {}) {}
  }

  const request = createMock<NestifyRequest>({ params: { id: "post-id" } });
  const slugRequest = createMock<NestifyRequest>({ params: { slug: "post-slug" } });
  const ability = () => ({ can: vi.fn<() => boolean>().mockReturnValue(true) }) as never;

  it.each([Action.Create, Action.Read])(
    "checks %s against the class itself, so no document is loaded",
    async (action) => {
      const mockAbility = ability();
      const handler = new GenericPolicyHandler(Post, action);

      await expect(handler.handle(request, mockAbility)).resolves.toBe(true);
      expect(mockAbility.can).toHaveBeenCalledWith(action, Post);
    },
  );

  it("defaults to read", async () => {
    const mockAbility = ability();

    await new GenericPolicyHandler(Post).handle(request, mockAbility);

    expect(mockAbility.can).toHaveBeenCalledWith(Action.Read, Post);
  });

  it("checks update against an instance carrying the request id", async () => {
    const mockAbility = ability();

    await new GenericPolicyHandler(Post, Action.Update).handle(request, mockAbility);

    expect(mockAbility.can).toHaveBeenCalledWith(
      Action.Update,
      expect.objectContaining({ data: { id: "post-id" } }),
    );
  });

  // Regression for C1: Delete used to be answered from the class, where CASL treats the
  // subject as type-only and drops its conditions, so any author could delete any row.
  describe(`${Action.Delete} is checked against the loaded document`, () => {
    const lookup = { param: "slug", field: "slug" };

    it("denies when no lookup is wired instead of falling back to the class", async () => {
      const mockAbility = ability();
      const handler = new GenericPolicyHandler(Post, Action.Delete);

      await expect(handler.handle(request, mockAbility)).resolves.toBe(false);
      expect(mockAbility.can).not.toHaveBeenCalled();
    });

    it("checks the ability against the resolved row, never the class", async () => {
      const mockAbility = ability();
      const document = new Post({ id: "post-slug" });
      const resolve = vi.fn().mockResolvedValue(document);
      const handler = new GenericPolicyHandler(Post, Action.Delete, lookup);

      await expect(handler.handle(slugRequest, mockAbility, resolve)).resolves.toBe(true);
      expect(resolve).toHaveBeenCalledWith(Post, "post-slug", "slug");
      expect(mockAbility.can).toHaveBeenCalledWith(Action.Delete, document);
      expect(mockAbility.can).not.toHaveBeenCalledWith(Action.Delete, Post);
    });

    it("denies when the row cannot be loaded", async () => {
      const mockAbility = ability();
      const resolve = vi.fn().mockResolvedValue(null);
      const handler = new GenericPolicyHandler(Post, Action.Delete, lookup);

      await expect(handler.handle(slugRequest, mockAbility, resolve)).resolves.toBe(false);
      expect(mockAbility.can).not.toHaveBeenCalled();
    });

    it("denies when the route param is absent without touching the database", async () => {
      const mockAbility = ability();
      const resolve = vi.fn();
      const handler = new GenericPolicyHandler(Post, Action.Delete, lookup);

      // `request` only carries an `id` param, so the lookup param is missing.
      await expect(handler.handle(request, mockAbility, resolve)).resolves.toBe(false);
      expect(resolve).not.toHaveBeenCalled();
      expect(mockAbility.can).not.toHaveBeenCalled();
    });
  });
});
