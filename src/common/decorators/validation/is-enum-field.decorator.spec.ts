import { Validator } from "class-validator";

import { IsEnumField } from "./is-enum-field.decorator";

const validator = new Validator();

enum Status {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

describe("isEnumField", () => {
  it("should pass for a valid enum value", async () => {
    class MyClass {
      @IsEnumField(Status)
      status!: Status;
    }

    const model = new MyClass();
    model.status = Status.ACTIVE;

    expect(await validator.validate(model)).toHaveLength(0);
  });

  it("should fail for a value outside the enum", async () => {
    class MyClass {
      @IsEnumField(Status)
      status!: Status;
    }

    const model = new MyClass();
    model.status = "archived" as Status;

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("isEnum");
  });

  it("should fail when the value is empty", async () => {
    class MyClass {
      @IsEnumField(Status)
      status!: Status;
    }

    const model = new MyClass();
    model.status = "" as Status;

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("isNotEmpty");
  });

  it("should skip validation when the field is optional and empty", async () => {
    class MyClass {
      @IsEnumField(Status, { required: false })
      status?: Status;
    }

    expect(await validator.validate(new MyClass())).toHaveLength(0);
  });

  it("should fail for a non-array value when each is true", async () => {
    class MyClass {
      @IsEnumField(Status, { each: true })
      statuses!: Status[];
    }

    const model = new MyClass();
    model.statuses = Status.ACTIVE as unknown as Status[];

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("isArray");
  });

  it("should fail for an empty array when each and required", async () => {
    class MyClass {
      @IsEnumField(Status, { each: true })
      statuses!: Status[];
    }

    const model = new MyClass();
    model.statuses = [];

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("arrayNotEmpty");
  });

  it("should pass for a non-empty array of valid enum values when each is true", async () => {
    class MyClass {
      @IsEnumField(Status, { each: true })
      statuses!: Status[];
    }

    const model = new MyClass();
    model.statuses = [Status.ACTIVE, Status.INACTIVE];

    expect(await validator.validate(model)).toHaveLength(0);
  });
});
