import { createMock } from "@golevelup/ts-vitest";
import { of } from "rxjs";

import { TagsController } from "./tags.controller";
import { TagsService } from "./tags.service";

describe("TagsController", () => {
  it("wires the injected service into the generated CRUD routes", () => {
    const service = createMock<TagsService>({
      create: vi.fn<() => unknown>(() => of({ id: 1 })),
      findAll: vi.fn<() => unknown>(() => of({ data: [], meta: {} as never })),
      findOne: vi.fn<() => unknown>(() => of({ id: 1 })),
      remove: vi.fn<() => unknown>(() => of({ id: 1 })),
      update: vi.fn<() => unknown>(() => of({ id: 1 })),
    });
    const controller = new TagsController(service);

    controller.findOne("tag-1");
    controller.findAll({ limit: 10 } as never);
    controller.create({ name: "nest" } as never);
    controller.update("tag-1", { name: "nestjs" } as never);
    controller.remove("tag-1");

    expect(service.findOne).toHaveBeenCalledWith("tag-1");
    expect(service.findAll).toHaveBeenCalled();
    expect(service.create).toHaveBeenCalledWith({ name: "nest" }, undefined);
    expect(service.update).toHaveBeenCalledWith("tag-1", { name: "nestjs" });
    expect(service.remove).toHaveBeenCalledWith("tag-1");
  });
});
