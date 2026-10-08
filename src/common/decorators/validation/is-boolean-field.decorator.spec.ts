import { plainToInstance } from "class-transformer";
import { Validator } from "class-validator";

import { IsBooleanField } from "./is-boolean-field.decorator";

const validator = new Validator();

describe("isBooleanField", () => {
  it("should pass for a boolean value", async () => {
    class MyClass {
      @IsBooleanField()
      flag!: boolean;
    }

    const model = new MyClass();
    model.flag = true;

    expect(await validator.validate(model)).toHaveLength(0);
  });

  it("should fail for a non-boolean value", async () => {
    class MyClass {
      @IsBooleanField()
      flag!: boolean;
    }

    const model = new MyClass();
    model.flag = "yes" as unknown as boolean;

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("isBoolean");
  });

  it("should fail when the value is empty", async () => {
    class MyClass {
      @IsBooleanField()
      flag!: boolean;
    }

    const model = new MyClass();
    model.flag = "" as unknown as boolean;

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("isNotEmpty");
  });

  it("should skip validation when the field is optional and empty", async () => {
    class MyClass {
      @IsBooleanField({ required: false })
      flag?: boolean;
    }

    expect(await validator.validate(new MyClass())).toHaveLength(0);
  });

  it("should fail for a non-array value when each is true", async () => {
    class MyClass {
      @IsBooleanField({ each: true })
      flags!: boolean[];
    }

    const model = new MyClass();
    model.flags = true as unknown as boolean[];

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("isArray");
  });

  it("should fail for an empty array when each and required", async () => {
    class MyClass {
      @IsBooleanField({ each: true })
      flags!: boolean[];
    }

    const model = new MyClass();
    model.flags = [];

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("arrayNotEmpty");
  });

  it("should coerce the strings true and false during transformation", async () => {
    class MyClass {
      @IsBooleanField()
      flag!: boolean;
    }

    const enabled = plainToInstance(MyClass, { flag: "true" });
    const disabled = plainToInstance(MyClass, { flag: "false" });

    expect(enabled.flag).toBe(true);
    expect(disabled.flag).toBe(false);
    expect(await validator.validate(enabled)).toHaveLength(0);
    expect(await validator.validate(disabled)).toHaveLength(0);
  });
});
