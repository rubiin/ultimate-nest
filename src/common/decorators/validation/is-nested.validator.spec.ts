import { plainToInstance } from "class-transformer";
import { IsString, Validator } from "class-validator";

import { IsNestedField } from "./is-nested.validator";

// Matches `AppUtils.validationPipeOptions()`, which disables unknown-value checks.
const validator = new Validator({ forbidUnknownValues: false });

class Nested {
  @IsString()
  name!: string;
}

describe("isNestedField", () => {
  it("should pass for a valid nested object", async () => {
    class MyClass {
      @IsNestedField(Nested)
      nested!: Nested;
    }

    // `Type` only takes effect through class-transformer, which is how the
    // validation pipe hydrates DTOs.
    const model = plainToInstance(MyClass, { nested: { name: "name" } });

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(0);
    expect(model.nested).toBeInstanceOf(Nested);
  });

  it("should fail when the nested object is empty", async () => {
    class MyClass {
      @IsNestedField(Nested)
      nested!: Nested;
    }

    const model = new MyClass();
    model.nested = undefined as unknown as Nested;

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("isNotEmpty");
  });

  it("should surface errors from the nested object", async () => {
    class MyClass {
      @IsNestedField(Nested)
      nested!: Nested;
    }

    const model = plainToInstance(MyClass, { nested: { name: 42 } });

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.children).toHaveLength(1);
  });

  it("should skip validation when the field is optional and empty", async () => {
    class MyClass {
      @IsNestedField(Nested, { required: false })
      nested?: Nested;
    }

    const errors = await validator.validate(new MyClass());

    expect(errors.length).toEqual(0);
  });

  it("should fail for a non-array value when each is true", async () => {
    class MyClass {
      @IsNestedField(Nested, { each: true })
      nested!: Nested[];
    }

    const model = new MyClass();
    model.nested = new Nested() as unknown as Nested[];

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("isArray");
  });

  it("should fail when the array exceeds arrayMaxSize", async () => {
    class MyClass {
      @IsNestedField(Nested, { arrayMaxSize: 1, each: true })
      nested!: Nested[];
    }

    const model = new MyClass();
    model.nested = [new Nested(), new Nested()];

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("arrayMaxSize");
  });

  it("should fail when the array is below arrayMinSize", async () => {
    class MyClass {
      @IsNestedField(Nested, { arrayMinSize: 2, each: true })
      nested!: Nested[];
    }

    const model = new MyClass();
    model.nested = [new Nested()];

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("arrayMinSize");
  });
});
