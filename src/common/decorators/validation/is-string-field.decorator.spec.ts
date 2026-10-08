import { Validator } from "class-validator";

import { IsStringField } from "./is-string-field.decorator";

const validator = new Validator();

describe("isStringField", () => {
  it("should pass for a valid string within the length bounds", async () => {
    class MyClass {
      @IsStringField()
      name!: string;
    }

    const model = new MyClass();
    model.name = "some name";

    expect(await validator.validate(model)).toHaveLength(0);
  });

  it("should fail for a non-string value", async () => {
    class MyClass {
      @IsStringField()
      name!: string;
    }

    const model = new MyClass();
    model.name = 42 as unknown as string;

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("isString");
  });

  it("should fail when the string is empty", async () => {
    class MyClass {
      @IsStringField()
      name!: string;
    }

    const model = new MyClass();
    model.name = "";

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("isNotEmpty");
  });

  it("should fail when the string is below minLength", async () => {
    class MyClass {
      @IsStringField()
      name!: string;
    }

    const model = new MyClass();
    model.name = "a";

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("minLength");
  });

  it("should fail when the string exceeds maxLength", async () => {
    class MyClass {
      @IsStringField({ maxLength: 5 })
      name!: string;
    }

    const model = new MyClass();
    model.name = "far too long";

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("maxLength");
  });

  it("should enforce a custom regex", async () => {
    class MyClass {
      @IsStringField({ regex: /^[a-z]+$/ })
      name!: string;
    }

    const model = new MyClass();
    model.name = "UPPERCASE";

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("matches");
  });

  it("should skip validation when the field is optional and empty", async () => {
    class MyClass {
      @IsStringField({ required: false })
      name?: string;
    }

    expect(await validator.validate(new MyClass())).toHaveLength(0);
  });

  it("should fail for a non-array value when each is true", async () => {
    class MyClass {
      @IsStringField({ each: true })
      names!: string[];
    }

    const model = new MyClass();
    model.names = "some name" as unknown as string[];

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("isArray");
  });

  it("should enforce array size bounds when each is true", async () => {
    class MyClass {
      @IsStringField({ arrayMinSize: 2, each: true })
      names!: string[];
    }

    const model = new MyClass();
    model.names = ["one"];

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("arrayMinSize");
  });
});
