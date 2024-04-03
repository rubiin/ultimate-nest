import { applyDecorators } from "@nestjs/common";
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
} from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";
import { ToBoolean } from "./transform.decorator";
import { BaseValidator } from "@common/@types";

type IsBooleanValidator = BaseValidator & { each?: boolean };

export function IsBooleanField(options_?: IsBooleanValidator) {
  const options: IsBooleanValidator = {
    each: false,
    required: true,
    ...options_,
  };
  const decoratorsToApply = [
    IsBoolean({
      message: i18nValidationMessage("validation.isDataType", {
        type: "boolean",
      }),
      each: options.each,
    }),
    ToBoolean(),
  ];

  if (options.required) {
    decoratorsToApply.push(
      IsNotEmpty({
        message: i18nValidationMessage("validation.isNotEmpty"),
        each: options.each,
      }),
    );

    if (options.each) {
      decoratorsToApply.push(
        ArrayNotEmpty({
          message: i18nValidationMessage("validation.isNotEmpty"),
        }),
      );
    }
  } else {
    decoratorsToApply.push(IsOptional());
  }

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
}
