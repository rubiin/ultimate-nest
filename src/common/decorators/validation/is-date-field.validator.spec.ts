import { Validator } from "class-validator";

import { IsDateField } from "./is-date-field.validator";

const validator = new Validator();

describe("isDateField", () => {
  it("should pass for a valid ISO date string", async () => {
    class MyClass {
      @IsDateField()
      date!: string;
    }

    const model = new MyClass();
    model.date = "2020-06-07T14:34:08.700Z";

    expect(await validator.validate(model)).toHaveLength(0);
  });

  it("should fail for a malformed date string", async () => {
    class MyClass {
      @IsDateField()
      date!: string;
    }

    const model = new MyClass();
    model.date = "not-a-date";

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("isDateString");
  });

  it("should fail when the date is empty", async () => {
    class MyClass {
      @IsDateField()
      date!: string;
    }

    const model = new MyClass();
    model.date = "";

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("isNotEmpty");
  });

  it("should skip validation when the field is optional and empty", async () => {
    class MyClass {
      @IsDateField({ required: false })
      date?: string;
    }

    expect(await validator.validate(new MyClass())).toHaveLength(0);
  });

  it("should enforce a lower bound when greaterThan is set", async () => {
    class MyClass {
      @IsDateField({ date: new Date("2020-01-01"), greaterThan: true })
      date!: string;
    }

    const model = new MyClass();
    model.date = "2019-06-07T14:34:08.700Z";

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("minDate");
  });

  it("should enforce an upper bound when lessThan is set", async () => {
    class MyClass {
      @IsDateField({ date: new Date("2020-01-01"), lessThan: true })
      date!: string;
    }

    const model = new MyClass();
    model.date = "2021-06-07T14:34:08.700Z";

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("maxDate");
  });

  it("should fail for a non-array value when each is true", async () => {
    class MyClass {
      @IsDateField({ each: true })
      dates!: string[];
    }

    const model = new MyClass();
    model.dates = "2020-06-07T14:34:08.700Z" as unknown as string[];

    const errors = await validator.validate(model);

    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toHaveProperty("isArray");
  });
});
