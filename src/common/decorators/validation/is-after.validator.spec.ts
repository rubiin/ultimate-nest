import { Validator } from "class-validator";
import { IsAfterField } from "./is-after.validator";

const validator = new Validator();

describe("isAfter", () => {
  class MyClass {
    startDate!: Date;

    @IsAfterField("startDate")
        endDate!: Date;
  }

  it("if endDate is after than startDate then it should succeed", async () => {
    const model = new MyClass();

    model.startDate = new Date("2022-02-22");
    model.endDate = new Date("2022-05-01");

    const errors = await validator.validate(model);
    expect(errors.length).toEqual(0);
  });

  it("if endDate is not after than startDate then it should fail", async () => {
    const model = new MyClass();

    model.startDate = new Date("2022-02-21");
    model.endDate = new Date("2022-01-01");

    const errors = await validator.validate(model);
    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toEqual({
      IsAfterConstraint: "endDate should be after startDate",
    });
  });

  it("if endDate is equal to  startDate then it should fail", async () => {
    const model = new MyClass();

    model.startDate = new Date("2022-02-21");
    model.endDate = model.startDate;

    const errors = await validator.validate(model);
    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toEqual({
      IsAfterConstraint: "endDate should be after startDate",
    });
  });
});
