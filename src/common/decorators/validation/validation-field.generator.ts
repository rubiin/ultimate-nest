import { Type } from "class-transformer";
import {
	ArrayNotEmpty,
	IsArray,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	Max,
	Min,
} from "class-validator";
import { enumToString } from "helper-fns";
import { i18nValidationMessage } from "nestjs-i18n";

import { MinMaxLength } from "./min-max-length.decorator";
import { Sanitize, Trim } from "./transform.decorator";

export class ValidatorFieldBuilder {
	private decoratorsToApply: PropertyDecorator[];

	constructor(readonly options: any) {}

	number() {
		this.decoratorsToApply.push(
			Type(() => Number),
			Min(this.options.min, { message: i18nValidationMessage("validation.min") }),
			Max(this.options.max, { message: i18nValidationMessage("validation.max") }),
		);

		return this;
	}

	string() {
		this.decoratorsToApply.push(
			IsString({
				message: i18nValidationMessage("validation.isDataType", {
					type: "string",
				}),
				each: this.options.each,
			}),
		);

		return this;
	}

	enum(entity: object) {
		this.decoratorsToApply.push(
			IsEnum(entity, {
				each: this.options.each,
				message: `must be a valid enum value,${enumToString(entity)}`,
			}),
		);

		return this;
	}

	addSanitize() {
		if (this.options.sanitize) {
			this.decoratorsToApply.push(Sanitize());
		}

		return this;
	}

	addTrim() {
		if (this.options.trim) {
			this.decoratorsToApply.push(Trim());
		}

		return this;
	}

	addMinMaxLength() {
		if (this.options.minLength && this.options.maxLength)
			MinMaxLength({
				minLength: this.options.minLength,
				maxLength: this.options.maxLength,
				each: this.options.each,
			});

		return this;
	}

	addRequired() {
		if (this.options.required) {
			this.decoratorsToApply.push(
				IsNotEmpty({
					message: i18nValidationMessage("validation.isNotEmpty"),
					each: this.options.each,
				}),
			);
		} else {
			this.decoratorsToApply.push(IsOptional());
		}

		return this;
	}

	addEach() {
		if (this.options.required && this.options.each) {
			this.decoratorsToApply.push(
				ArrayNotEmpty({
					message: i18nValidationMessage("validation.isNotEmpty"),
				}),
			);
		}

		if (this.options.each) {
			this.decoratorsToApply.push(
				IsArray({
					message: i18nValidationMessage("validation.isDataType", {
						type: "array",
					}),
				}),
			);
		}

		return this;
	}

	build() {
		return this.decoratorsToApply;
	}
}

export { ValidatorFieldBuilder as V };
