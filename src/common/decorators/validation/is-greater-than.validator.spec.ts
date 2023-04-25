import { Validator } from "class-validator";

import { IsGreaterThan } from "./is-greater-than.validator";

const validator = new Validator();

describe("IsGreaterThan", () => {
	class MyClass {
		passMarks!: number;

		@IsGreaterThan("passMarks")
		totalMarks!: number;
	}

	it("if totalMarks is greater than passMarks then it should succeed", () => {
		const model = new MyClass();

		model.passMarks = 40;
		model.totalMarks = 100;

		return validator.validate(model).then(errors => {
			expect(errors.length).toEqual(0);
		});
	});

	it("if totalMarks is less than passMarks then it should fail", () => {
		const model = new MyClass();

		model.passMarks = 100;
		model.totalMarks = 40;

		return validator.validate(model).then(errors => {
			expect(errors.length).toEqual(1);
			expect(errors[0].constraints).toEqual({
				IsGreaterThanConstraint: "totalMarks should be greater than passMarks",
			});
		});
	});

	it("if totalMarks is equal to passMarks then it should fail", () => {
		const model = new MyClass();

		model.passMarks = 100;
		model.totalMarks = 100;

		return validator.validate(model).then(errors => {
			expect(errors.length).toEqual(1);
			expect(errors[0].constraints).toEqual({
				IsGreaterThanConstraint: "totalMarks should be greater than passMarks",
			});
		});
	});
});
