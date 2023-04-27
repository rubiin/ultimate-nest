import { Validator } from "class-validator";

import { IsPassword } from "./is-password.validator";

const validator = new Validator();

describe("IsPassword", () => {
	class MyClass {
		@IsPassword()
		password: string;
	}

	it("if password satisfies then it should succeed (one uppercase,one lowercase, one number and one symbol and more than 8 characters)", () => {
		const model = new MyClass();

		model.password = "Test-1234";

		return validator.validate(model).then(errors => {
			expect(errors.length).toEqual(0);
		});
	});

	it("if password is not valid then it should fail", () => {
		const model = new MyClass();

		model.password = "notStrongPassword";

		return validator.validate(model).then(errors => {
			expect(errors.length).toEqual(1);
			expect(errors[0].property).toEqual("password");
			expect(errors[0].constraints).toEqual({
				IsPasswordConstraint:
					"password should contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character",
			});
			expect(errors[0].value).toEqual("notStrongPassword");
		});
	});
});
