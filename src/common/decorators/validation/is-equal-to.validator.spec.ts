import { Validator } from "class-validator";
import { IsEqualToField } from "./is-equal-to.validator";

const validator = new Validator();

describe("isEqualToField", () => {
  class MyClass {
    password!: string;

    @IsEqualToField("password")
        confirmPassword!: string;
  }

  it("if password and confirm password are same then it should succeed", async () => {
    const model = new MyClass();

    model.password = "Test@1234";
    model.confirmPassword = "Test@1234";

    const errors = await validator.validate(model);
    expect(errors.length).toEqual(0);
  });

  it("if password and confirm password are not same then it should fail", async () => {
    const model = new MyClass();

    model.password = "UniquePassword@123";
    model.confirmPassword = "DifferentPassword@1234";

    const errors = await validator.validate(model);
    expect(errors.length).toEqual(1);
    expect(errors[0]!.constraints).toEqual({
      IsEqualToConstraint: "confirmPassword should be equal to password",
    });
  });
});
