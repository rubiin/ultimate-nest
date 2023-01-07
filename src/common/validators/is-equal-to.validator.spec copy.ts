import { Validator } from "class-validator";

import { IsEqualTo } from "./is-equal-to.validator";

const validator = new Validator();

describe("IsEqualTo", () => {
	class MyClass {
		password!: string;

		@IsEqualTo("password")
		confirmPassword!: string;
	}

	it("if password and confirm password are same then it should succeed", () => {
		const model = new MyClass();

		model.password = "Test@1234";
		model.confirmPassword = "Test@1234";

		return validator.validate(model).then(errors => {
			expect(errors.length).toEqual(0);
		});
	});

	it("if password and confirm password are not same then it should fail", () => {
		const model = new MyClass();

		model.password = "UniquePassword@123";
		model.confirmPassword = "DifferentPassword@1234";

		return validator.validate(model).then(errors => {
			expect(errors.length).toEqual(1);
			expect(errors[0].constraints).toEqual({
				IsEqualToConstraint: "confirmPassword should be equal to password",
			});
		});
	});
});
