import { Validator } from "class-validator";

import { IsProfane } from "./is-profane.validator";

const validator = new Validator();

describe("isProfane", () => {
  class MyClass {
    @IsProfane()
    text!: string;
  }

  it("should pass if text doesn't profane words", async () => {
    const model = new MyClass();

    model.text = "clean text";

    const errors = await validator.validate(model);
    expect(errors.length).toEqual(0);
  });

  it("should fail if text has profane words", async () => {
    const model = new MyClass();

    model.text = "Don't be an ash0le";

    const errors = await validator.validate(model);
    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toEqual({
      IsProfaneConstraint: "text has profane words",
    });
  });

  it("should fail when any value of an array is profane", async () => {
    class ManyTexts {
      @IsProfane()
      texts!: string[];
    }

    const model = new ManyTexts();
    model.texts = ["Don't be an ash0le", "clean text"];

    expect(await validator.validate(model)).toHaveLength(1);
  });

  it("should pass when every value of an array is clean", async () => {
    class ManyTexts {
      @IsProfane()
      texts!: string[];
    }

    const model = new ManyTexts();
    model.texts = ["clean text", "also fine"];

    expect(await validator.validate(model)).toHaveLength(0);
  });
});
