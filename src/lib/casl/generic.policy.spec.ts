import { Action } from "@common/@types";
import { createMock } from "@golevelup/ts-vitest";

import { GenericPolicyHandler } from "./generic.policy";

describe("genericPolicyHandler", () => {
  class Post {
    constructor(public data: { id?: string } = {}) {}
  }

  const request = createMock<NestifyRequest>({ params: { id: "post-id" } });

  it.each([Action.Create, Action.Read, Action.Delete])(
    "checks %s against the class itself, so no document is loaded",
    (action) => {
      const ability = { can: vi.fn<() => boolean>().mockReturnValue(true) } as never;
      const handler = new GenericPolicyHandler(Post, action);

      expect(handler.handle(request, ability)).toBe(true);
      expect(ability.can).toHaveBeenCalledWith(action, Post);
    },
  );

  it("defaults to read", () => {
    const ability = { can: vi.fn<() => boolean>().mockReturnValue(true) } as never;

    new GenericPolicyHandler(Post).handle(request, ability);

    expect(ability.can).toHaveBeenCalledWith(Action.Read, Post);
  });

  it("checks update against an instance carrying the request id", () => {
    const ability = { can: vi.fn<() => boolean>().mockReturnValue(true) } as never;

    new GenericPolicyHandler(Post, Action.Update).handle(request, ability);

    expect(ability.can).toHaveBeenCalledWith(
      Action.Update,
      expect.objectContaining({ data: { id: "post-id" } }),
    );
  });
});
