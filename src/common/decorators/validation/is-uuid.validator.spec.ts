import { Validator } from "class-validator";

import { IsUUIDField } from "./is-uuid.validator";

const validator = new Validator();

const uuidV4 = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";

describe("isUuidField", () => {
  it("should pass for a valid uuid", async () => {
    class MyClass {
      @IsUUIDField()
      uuid!: string;
    }

    const model = new MyClass();
    model.uuid = uuidV4;

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(0);
  });

  it("should fail for a malformed uuid", async () => {
    class MyClass {
      @IsUUIDField()
      uuid!: string;
    }

    const model = new MyClass();
    model.uuid = "not-a-uuid";

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("isUuid");
  });

  it("should fail when the uuid is empty", async () => {
    class MyClass {
      @IsUUIDField()
      uuid!: string;
    }

    const model = new MyClass();
    model.uuid = "";

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("isNotEmpty");
  });

  it("should skip validation when the field is optional and empty", async () => {
    class MyClass {
      @IsUUIDField({ required: false })
      uuid?: string;
    }

    const model = new MyClass();

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(0);
  });

  it("should fail for a non-array value when each is true", async () => {
    class MyClass {
      @IsUUIDField({ each: true })
      uuids!: string[];
    }

    const model = new MyClass();
    model.uuids = uuidV4 as unknown as string[];

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("isArray");
  });

  it("should fail for an empty array when each and required", async () => {
    class MyClass {
      @IsUUIDField({ each: true })
      uuids!: string[];
    }

    const model = new MyClass();
    model.uuids = [];

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("arrayNotEmpty");
  });

  it("should pass for a non-empty array of valid uuids when each is true", async () => {
    class MyClass {
      @IsUUIDField({ each: true })
      uuids!: string[];
    }

    const model = new MyClass();
    model.uuids = [uuidV4];

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(0);
  });
});
