import { Validator } from "class-validator";
import { IsDateInFormat } from "./is-date-format.validator";

const validator = new Validator();

describe("isDateInFormat", () => {
  class MyClass {
    @IsDateInFormat("yyyy-MM-dd")
        date!: string;
  }

  it("if date satisfies  the format then it should succeed", async () => {
    const model = new MyClass();

    model.date = "2014-04-03";

    const errors = await validator.validate(model);
    expect(errors.length).toEqual(0);
  });

  it("if date does not satisfies  the format then it should fail", async () => {
    const model = new MyClass();

    model.date = "2014/04/03";

    const errors = await validator.validate(model);
    expect(errors.length).toEqual(1);
  });
});
