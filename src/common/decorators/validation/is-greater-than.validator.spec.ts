import { Validator } from "class-validator";
import { IsGreaterThan } from "./is-greater-than.validator";

const validator = new Validator();

describe("isGreaterThan", () => {
  class MyClass {
    passMarks!: number;

    @IsGreaterThan("passMarks")
        totalMarks!: number;
  }

  it("if totalMarks is greater than passMarks then it should succeed", async () => {
    const model = new MyClass();

    model.passMarks = 40;
    model.totalMarks = 100;

    const errors = await validator.validate(model);
    expect(errors.length).toEqual(0);
  });

  it("if totalMarks is less than passMarks then it should fail", async () => {
    const model = new MyClass();

    model.passMarks = 100;
    model.totalMarks = 40;

    const errors = await validator.validate(model);
    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toEqual({
      IsGreaterThanConstraint: "totalMarks should be greater than passMarks",
    });
  });

  it("if totalMarks is equal to passMarks then it should fail", async () => {
    const model = new MyClass();

    model.passMarks = 100;
    model.totalMarks = 100;

    const errors = await validator.validate(model);
    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toEqual({
      IsGreaterThanConstraint: "totalMarks should be greater than passMarks",
    });
  });
});
