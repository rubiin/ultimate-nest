import { Validator } from "class-validator";

import { IsNumberField } from "./is-number-field.decorator";

const validator = new Validator();

describe("isNumberField", () => {
  it("should pass for a positive integer within bounds", async () => {
    class MyClass {
      @IsNumberField()
      count!: number;
    }

    const model = new MyClass();
    model.count = 10;

    expect(await validator.validate(model)).toHaveLength(0);
  });

  it("should fail for a non-integer when int is true", async () => {
    class MyClass {
      @IsNumberField()
      count!: number;
    }

    const model = new MyClass();
    model.count = 10.5;

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("isInt");
  });

  it("should pass for a decimal when int is false", async () => {
    class MyClass {
      @IsNumberField({ int: false })
      count!: number;
    }

    const model = new MyClass();
    model.count = 10.5;

    expect(await validator.validate(model)).toHaveLength(0);
  });

  it("should fail for a non-number", async () => {
    class MyClass {
      @IsNumberField()
      count!: number;
    }

    const model = new MyClass();
    model.count = "10" as unknown as number;

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("isInt");
  });

  it("should fail below min", async () => {
    class MyClass {
      @IsNumberField({ min: 5 })
      count!: number;
    }

    const model = new MyClass();
    model.count = 1;

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("min");
  });

  it("should fail above max", async () => {
    class MyClass {
      @IsNumberField({ max: 5 })
      count!: number;
    }

    const model = new MyClass();
    model.count = 10;

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("max");
  });

  it("should fail for zero when positive is true", async () => {
    class MyClass {
      @IsNumberField()
      count!: number;
    }

    const model = new MyClass();
    model.count = 0;

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("isPositive");
  });

  it("should allow zero when positive is false", async () => {
    class MyClass {
      @IsNumberField({ min: 0, positive: false })
      count!: number;
    }

    const model = new MyClass();
    model.count = 0;

    expect(await validator.validate(model)).toHaveLength(0);
  });

  it("should fail when the value is empty", async () => {
    class MyClass {
      @IsNumberField()
      count!: number;
    }

    const model = new MyClass();
    model.count = undefined as unknown as number;

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("isNotEmpty");
  });

  it("should skip validation when the field is optional and empty", async () => {
    class MyClass {
      @IsNumberField({ required: false })
      count?: number;
    }

    expect(await validator.validate(new MyClass())).toHaveLength(0);
  });

  it("should fail for a non-array value when each is true", async () => {
    class MyClass {
      @IsNumberField({ each: true })
      counts!: number[];
    }

    const model = new MyClass();
    model.counts = 10 as unknown as number[];

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("isArray");
  });
});
