import { Validator } from "class-validator";

import { IsAfter } from "./is-after.validator";

const validator = new Validator();

describe("IsAfter", () => {
	class MyClass {
		startDate!: Date;

		@IsAfter("startDate")
		endDate!: Date;
	}

	it("if endDate is after than startDate then it should succeed", () => {
		const model = new MyClass();

		model.startDate = new Date("2022-02-21");
		model.endDate = new Date("2022-05-01");

		return validator.validate(model).then(errors => {
			expect(errors.length).toEqual(0);
		});
	});

	it("if endDate is not after than startDate then it should fail", () => {
		const model = new MyClass();

		model.startDate = new Date("2022-02-21");
		model.endDate = new Date("2022-01-01");

		return validator.validate(model).then(errors => {
			expect(errors.length).toEqual(1);
			expect(errors[0].constraints).toEqual({
				IsAfterConstraint: "endDate should be after startDate",
			});
		});
	});

	it("if endDate is equal to  startDate then it should fail", () => {
		const model = new MyClass();

		model.startDate = new Date("2022-02-21");
		model.endDate = model.startDate;

		return validator.validate(model).then(errors => {
			expect(errors.length).toEqual(1);
			expect(errors[0].constraints).toEqual({
				IsAfterConstraint: "endDate should be after startDate",
			});
		});
	});
});
