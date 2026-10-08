import { Validator } from "class-validator";

import { MinMaxLength } from "./min-max-length.decorator";

const validator = new Validator();

describe("minMaxLength", () => {
  it("should pass for a string within the length bounds", async () => {
    class MyClass {
      @MinMaxLength()
      name!: string;
    }

    const model = new MyClass();
    model.name = "some name";

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(0);
  });

  it("should fail when the string is shorter than minLength", async () => {
    class MyClass {
      @MinMaxLength()
      name!: string;
    }

    const model = new MyClass();
    model.name = "a";

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("minLength");
  });

  it("should fail when the string is longer than maxLength", async () => {
    class MyClass {
      @MinMaxLength({ maxLength: 5 })
      name!: string;
    }

    const model = new MyClass();
    model.name = "far too long";

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("maxLength");
  });

  it("should apply the bounds to every element when each is true", async () => {
    class MyClass {
      @MinMaxLength({ each: true, maxLength: 5 })
      names!: string[];
    }

    const model = new MyClass();
    model.names = ["ok", "far too long"];

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("maxLength");
  });

  it("should default to a minimum of 2 characters", async () => {
    class MyClass {
      @MinMaxLength()
      name!: string;
    }

    const model = new MyClass();
    model.name = "ab";

    expect(await validator.validate(model)).toHaveLength(0);
  });
});
