import { ApiFile, ApiFileFields, ApiFileResponse, ApiFiles } from "./api-file.decorator";

type SwaggerSchema = {
  properties: Record<string, Record<string, unknown>>;
  required: string[];
  type: string;
};

type ParamMetadata = { in: string; required?: boolean; schema?: SwaggerSchema };

const paramsOf = (method: object) =>
  (Reflect.getMetadata("swagger/apiParameters", method) ?? []) as ParamMetadata[];

const consumesOf = (method: object) =>
  Reflect.getMetadata("swagger/apiConsumes", method) as string[];

const bodySchemaOf = (method: object) => paramsOf(method).find((p) => p.in === "body")?.schema;

describe("ApiFile", () => {
  it("documents a single binary field and consumes multipart", () => {
    class Controller {
      @ApiFile()
      upload(): void {}
    }

    const method = new Controller().upload;

    expect(consumesOf(method)).toEqual(["multipart/form-data"]);
    expect(bodySchemaOf(method)).toEqual({
      properties: { file: { format: "binary", type: "string" } },
      required: [],
      type: "object",
    });
  });

  it("honours a custom field name and the required flag", () => {
    class Controller {
      @ApiFile({ fieldName: "avatar", required: true })
      upload(): void {}
    }

    const schema = bodySchemaOf(new Controller().upload);

    expect(schema?.properties).toHaveProperty("avatar");
    expect(schema?.required).toEqual(["avatar"]);
  });
});

describe("ApiFiles", () => {
  it("documents an array of binary files", () => {
    class Controller {
      @ApiFiles()
      upload(): void {}
    }

    const method = new Controller().upload;

    expect(consumesOf(method)).toEqual(["multipart/form-data"]);
    expect(bodySchemaOf(method)).toEqual({
      properties: {
        files: { items: { format: "binary", type: "string" }, type: "array" },
      },
      required: [],
      type: "object",
    });
  });

  it("honours a custom field name and the required flag", () => {
    class Controller {
      @ApiFiles({ fieldName: "photos", maxCount: 3, required: true })
      upload(): void {}
    }

    const schema = bodySchemaOf(new Controller().upload);

    expect(schema?.properties).toHaveProperty("photos");
    expect(schema?.required).toEqual(["photos"]);
  });
});

describe("ApiFileFields", () => {
  it("documents one binary property per field and lists only the required ones", () => {
    class Controller {
      @ApiFileFields([
        { maxCount: 1, name: "front", required: true },
        { maxCount: 1, name: "back" },
      ])
      upload(): void {}
    }

    const method = new Controller().upload;
    const schema = bodySchemaOf(method);

    expect(consumesOf(method)).toEqual(["multipart/form-data"]);
    expect(schema?.properties).toEqual({
      back: { format: "binary", type: "string" },
      front: { format: "binary", type: "string" },
    });
    expect(schema?.required).toEqual(["front"]);
  });

  it("lists nothing as required when no field is marked required", () => {
    class Controller {
      @ApiFileFields([{ maxCount: 1, name: "front" }])
      upload(): void {}
    }

    expect(bodySchemaOf(new Controller().upload)?.required).toEqual([]);
  });
});

describe("ApiFileResponse", () => {
  it("documents a binary 200 response and declares the given mime types", () => {
    class Controller {
      @ApiFileResponse("image/png", "image/webp")
      download(): void {}
    }

    const method = new Controller().download;

    expect(Reflect.getMetadata("swagger/apiResponse", method)).toMatchObject({
      200: { schema: { format: "binary", type: "string" } },
    });
    expect(Reflect.getMetadata("swagger/apiProduces", method)).toEqual(["image/png", "image/webp"]);
  });
});
