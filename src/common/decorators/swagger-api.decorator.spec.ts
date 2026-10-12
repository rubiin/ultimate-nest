import { HttpStatus } from "@nestjs/common";

import { SwaggerResponse } from "./swagger-api.decorator";

type ResponseMetadata = Record<string, { description?: string }>;

const responsesOf = (method: object) =>
  (Reflect.getMetadata("swagger/apiResponse", method) ?? {}) as ResponseMetadata;

describe("swaggerResponse", () => {
  it("should document notFound under the 404 status", () => {
    class Controller {
      @SwaggerResponse({ notFound: "Item does not exist.", operation: "Find item" })
      findOne(): void {}
    }

    const responses = responsesOf(new Controller().findOne);

    expect(responses[HttpStatus.NOT_FOUND]?.description).toEqual("Item does not exist.");
    expect(responses[HttpStatus.BAD_REQUEST]).toBeUndefined();
  });

  it("should document badRequest under the 400 status", () => {
    class Controller {
      @SwaggerResponse({ badRequest: "Item already exists.", operation: "Create item" })
      create(): void {}
    }

    const responses = responsesOf(new Controller().create);

    expect(responses[HttpStatus.BAD_REQUEST]?.description).toEqual("Item already exists.");
    expect(responses[HttpStatus.NOT_FOUND]).toBeUndefined();
  });

  it("should keep the two statuses separate", () => {
    class Controller {
      @SwaggerResponse({
        badRequest: "Item already exists.",
        notFound: "Item does not exist.",
        operation: "Item update",
      })
      update(): void {}
    }

    const responses = responsesOf(new Controller().update);

    expect(responses[HttpStatus.BAD_REQUEST]?.description).toEqual("Item already exists.");
    expect(responses[HttpStatus.NOT_FOUND]?.description).toEqual("Item does not exist.");
  });

  it("should omit both statuses when neither is given", () => {
    class Controller {
      @SwaggerResponse({ operation: "Ping" })
      ping(): void {}
    }

    expect(responsesOf(new Controller().ping)).toEqual({});
  });

  it("should mark every declared path param as required", () => {
    class Controller {
      @SwaggerResponse({ operation: "Item update", params: ["idx"] })
      update(): void {}
    }

    const params = Reflect.getMetadata("swagger/apiParameters", new Controller().update) as {
      in: string;
      name: string;
      required: boolean;
      type: unknown;
    }[];

    expect(params).toHaveLength(1);
    expect(params[0]).toMatchObject({ in: "path", name: "idx", required: true });
    expect(params[0].type).toEqual(String);
  });
});
