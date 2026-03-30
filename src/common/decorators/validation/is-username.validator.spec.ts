import { Validator } from "class-validator";
import { IsUsernameField } from "./is-username.validator";

const validator = new Validator();

describe("isUserName", () => {
  class MyClass {
    @IsUsernameField()
    username!: string;
  }

  it("if username satisfies then it should succeed", async () => {
    const model = new MyClass();

    model.username = "username123";

    const errors = await validator.validate(model);
    expect(errors.length).toEqual(0);
  });

  it("if username is not valid then it should fail", async () => {
    const model = new MyClass();

    model.username = "@123Yest";

    const errors = await validator.validate(model);
    expect(errors.length).toEqual(1);
    expect(errors[0]!.property).toEqual("username");
    expect(errors[0]!.constraints).toEqual({
      IsUsernameConstraint: "username must fulfill username's criteria",
    });
    expect(errors[0]!.value).toEqual("@123Yest");
  });
});
