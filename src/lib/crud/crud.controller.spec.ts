import { BaseEntity } from "@common/database";
import { IsString } from "class-validator";
import { of } from "rxjs";

import { BaseService } from "./crud.service";
import { AbstractValidationPipe, ControllerFactory } from "./crud.controller";

class Item extends BaseEntity {
  title!: string;
}

class QueryDto {
  limit?: number;
  page?: number;
}

class CreateDto {
  @IsString()
  title!: string;
}

class UpdateDto {
  title!: string;
}

describe("AbstractValidationPipe", () => {
  class Dto {
    @IsString()
    name!: string;
  }

  it("should validate against the type registered for the argument kind", async () => {
    const pipe = new AbstractValidationPipe({ body: Dto });

    await expect(
      pipe.transform({ name: "ada" }, { metatype: undefined, type: "body" }),
    ).resolves.toBeInstanceOf(Dto);
  });

  it("should fall back to the declared metatype when none is registered", async () => {
    const pipe = new AbstractValidationPipe({});

    await expect(
      pipe.transform({ name: "ada" }, { metatype: Dto, type: "body" }),
    ).resolves.toBeInstanceOf(Dto);
  });
});

describe("ControllerFactory", () => {
  const service = {
    create: vi.fn<() => unknown>(() => of({ id: 1 })),
    findAll: vi.fn<() => unknown>(() => of({ data: [], meta: {} })),
    findOne: vi.fn<() => unknown>(() => of({ id: 1 })),
    remove: vi.fn<() => unknown>(() => of({ id: 1 })),
    update: vi.fn<() => unknown>(() => of({ id: 1 })),
  };

  const build = () => {
    const Controller = ControllerFactory(QueryDto, CreateDto, UpdateDto);
    const instance = new Controller() as unknown as {
      service: BaseService<Item, QueryDto, CreateDto, UpdateDto>;
    } & CrudHandlers;
    instance.service = service as never;

    return instance;
  };

  interface CrudHandlers {
    create(body: CreateDto, user?: { id: number }): unknown;
    findAll(query: QueryDto): unknown;
    findOne(index: string): unknown;
    remove(index: string): unknown;
    update(index: string, body: UpdateDto): unknown;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delegate each route to the service", () => {
    const controller = build();

    controller.findOne("item-1");
    controller.findAll({ limit: 10 } as QueryDto);
    controller.create({ title: "t" }, { id: 1 });
    controller.update("item-1", { title: "edited" });
    controller.remove("item-1");

    expect(service.findOne).toHaveBeenCalledWith("item-1");
    expect(service.findAll).toHaveBeenCalledWith({ limit: 10 });
    expect(service.create).toHaveBeenCalledWith({ title: "t" }, { id: 1 });
    expect(service.update).toHaveBeenCalledWith("item-1", { title: "edited" });
    expect(service.remove).toHaveBeenCalledWith("item-1");
  });

  it("should allow creating without a logged-in user", () => {
    const controller = build();

    controller.create({ title: "t" });

    expect(service.create).toHaveBeenCalledWith({ title: "t" }, undefined);
  });
});
