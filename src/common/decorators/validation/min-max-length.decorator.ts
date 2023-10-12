import { applyDecorators } from "@nestjs/common";
import { MaxLength, MinLength } from "class-validator";
import type { MinMaxLengthOptions } from "@common/@types";
import { validationI18nMessage } from "@lib/i18n";

/**
 * It's a decorator that validates the length of a string to be between a minimum and maximum length
 * @param options_ - MinMaxLengthOptions
 * @returns A function that takes in a target, propertyKey, and descriptor
 */
export function MinMaxLength(options_?: MinMaxLengthOptions) {
  const options = { minLength: 2, maxLength: 500, each: false, ...options_ };

  return applyDecorators(
    MinLength(options.minLength, {
      message: validationI18nMessage("validation.minLength"),
      each: options.each,
    }),
    MaxLength(options.maxLength, {
      message: validationI18nMessage("validation.maxLength"),
      each: options.each,
    }),
  );
}
