import { Validator } from "class-validator";

import { IsUsername } from "./is-username.validator";

const validator = new Validator();

describe("IsUserName", () => {
	class MyClass {
		@IsUsername()
		username: string;
	}

	it("if username satisfies then it should succeed", () => {
		const model = new MyClass();

		model.username = "username123";

		return validator.validate(model).then(errors => {
			expect(errors.length).toEqual(0);
		});
	});

	it("if username is not valid then it should fail", () => {
		const model = new MyClass();

		model.username = "@123Yest";

		return validator.validate(model).then(errors => {
			expect(errors.length).toEqual(1);
			expect(errors[0].property).toEqual("username");
			expect(errors[0].constraints).toEqual({
				IsUsernameConstraint: "username must fulfill username's criteria",
			});
			expect(errors[0].value).toEqual("@123Yest");
		});
	});
});
