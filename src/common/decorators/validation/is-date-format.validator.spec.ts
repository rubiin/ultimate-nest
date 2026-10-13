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

  it("passes when any value of an array matches the format", async () => {
    class ManyDates {
      @IsDateInFormat("yyyy-MM-dd")
      dates!: string[];
    }

    const model = new ManyDates();
    model.dates = ["2014/04/03", "2014-04-03"];

    expect(await validator.validate(model)).toHaveLength(0);
  });

  it("fails when no value of an array matches the format", async () => {
    class ManyDates {
      @IsDateInFormat("yyyy-MM-dd")
      dates!: string[];
    }

    const model = new ManyDates();
    model.dates = ["2014/04/03", "03/04/2014"];

    expect(await validator.validate(model)).toHaveLength(1);
  });

  it("describes the expected format in the default message", async () => {
    const model = new MyClass();
    model.date = "2014/04/03";

    const [error] = await validator.validate(model);

    expect(error?.constraints).toEqual({
      IsDateInFormatConstraint: "date should be in yyyy-MM-dd format",
    });
  });
});
