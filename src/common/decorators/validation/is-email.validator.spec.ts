import { Validator } from "class-validator";

import { IsEmailField } from "./is-email.validator";

const validator = new Validator();

describe("isEmailField", () => {
  it("should pass for a valid email address", async () => {
    class MyClass {
      @IsEmailField()
      email!: string;
    }

    const model = new MyClass();
    model.email = "someone@gmail.com";

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(0);
  });

  it("should fail for a malformed email address", async () => {
    class MyClass {
      @IsEmailField()
      email!: string;
    }

    const model = new MyClass();
    model.email = "not-an-email";

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.property).toEqual("email");
  });

  it("should fail when the email address is empty", async () => {
    class MyClass {
      @IsEmailField()
      email!: string;
    }

    const model = new MyClass();
    model.email = "";

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("isNotEmpty");
  });

  it("should skip validation when the field is optional and empty", async () => {
    class MyClass {
      @IsEmailField({ required: false })
      email?: string;
    }

    const model = new MyClass();

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(0);
  });

  it("should fail for a non-array value when each is true", async () => {
    class MyClass {
      @IsEmailField({ each: true })
      emails!: string[];
    }

    const model = new MyClass();
    model.emails = "someone@gmail.com" as unknown as string[];

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("isArray");
  });

  it("should fail for an empty array when each and required", async () => {
    class MyClass {
      @IsEmailField({ each: true })
      emails!: string[];
    }

    const model = new MyClass();
    model.emails = [];

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("arrayNotEmpty");
  });

  it("should pass for a non-empty array of valid emails when each is true", async () => {
    class MyClass {
      @IsEmailField({ each: true })
      emails!: string[];
    }

    const model = new MyClass();
    model.emails = ["someone@gmail.com", "another@gmail.com"];

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(0);
  });
});
