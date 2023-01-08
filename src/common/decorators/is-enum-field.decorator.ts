import { applyDecorators } from "@nestjs/common";
import { IsArray, IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { enumToString } from "helper-fns";
import { i18nValidationMessage } from "nestjs-i18n";

interface IsEnumFieldOptions {
	required?: boolean;
	each?: boolean;
}

/**
 * It's a decorator that validates that the field is an enum value
 * @param {object} entity - object - The enum object to validate against.
 * @param {IsEnumFieldOptions} [ops] - IsEnumFieldOptions
 * @returns A decorator function that takes in a target, propertyKey, and descriptor.
 */
export const IsEnumField = (entity: object, ops?: IsEnumFieldOptions) => {
	const options = { each: false, required: true, ...ops };
	const decoratorsToApply = [
		IsEnum(entity, {
			each: options.each,
			message: `must be a valid enum value,${enumToString(entity)}`,
		}),
	];

	options.required
		? decoratorsToApply.push(
				IsNotEmpty({
					message: i18nValidationMessage("validation.isNotEmpty"),
					each: options.each,
				}),
		  )
		: decoratorsToApply.push(IsOptional());

	if (options.each) {
		decoratorsToApply.push(
			IsArray({
				message: i18nValidationMessage("validation.isDataType", {
					type: "array",
				}),
			}),
		);
	}

	return applyDecorators(...decoratorsToApply);
};
