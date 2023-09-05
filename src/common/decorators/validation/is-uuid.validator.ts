import { applyDecorators } from "@nestjs/common";
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsOptional, IsUUID } from "class-validator";
import type { EnumFieldOptions as UUIDFieldOptions } from "@common/@types";
import { validationI18nMessage } from "@lib/i18n";

/**
 * It's a decorator that validates that the field is an uuid value
 * @param options_ - UUIDFieldOptions
 * @returns A decorator function that takes in a target, propertyKey, and descriptor.
 */
export const IsUUIDField = (options_?: UUIDFieldOptions) => {
  const options: UUIDFieldOptions = {
    each: false,
    required: true,
    ...options_,
  };
  const decoratorsToApply = [
    IsUUID("4", {
      message: validationI18nMessage("validation.isDataType", {
        type: "uuid",
      }),
      each: options.each,
    }),
  ];

  if (options.required) {
    decoratorsToApply.push(
      IsNotEmpty({
        message: validationI18nMessage("validation.isNotEmpty"),
        each: options.each,
      }),
    );

    if (options.each) {
      decoratorsToApply.push(
        ArrayNotEmpty({
          message: validationI18nMessage("validation.isNotEmpty"),
        }),
      );
    }
  }
  else {
    decoratorsToApply.push(IsOptional());
  }

  if (options.each) {
    decoratorsToApply.push(
      IsArray({
        message: validationI18nMessage("validation.isDataType", {
          type: "array",
        }),
      }),
    );
  }

  return applyDecorators(...decoratorsToApply);
};
