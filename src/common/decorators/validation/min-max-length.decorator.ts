import { MinMaxLengthOptions } from "@common/@types";
import { validationI18nMessage } from "@lib/i18n";
import { applyDecorators } from "@nestjs/common";
import { MaxLength, MinLength } from "class-validator";

/**
 * It's a decorator that validates the length of a string to be between a minimum and maximum length
 * @param options_ - MinMaxLengthOptions
 * @returns A function that takes in a target, propertyKey, and descriptor
 */
export function MinMaxLength(options_?: MinMaxLengthOptions) {
  const options = { each: false, maxLength: 500, minLength: 2, ...options_ };

  return applyDecorators(
    MinLength(options.minLength, {
      each: options.each,
      message: validationI18nMessage("validation.minLength"),
    }),
    MaxLength(options.maxLength, {
      each: options.each,
      message: validationI18nMessage("validation.maxLength"),
    }),
  );
}
