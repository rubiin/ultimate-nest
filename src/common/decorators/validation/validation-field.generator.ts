import { NumberFieldOptions, StringFieldOptions } from "@common/@types";
import { MinMaxLength } from "@common/decorators";
import { validationI18nMessage } from "@lib/i18n";
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

import { Sanitize, Trim } from "./transform.decorator";

export class ValidatorFieldBuilder {
  private decoratorsToApply!: PropertyDecorator[];

  constructor(readonly options: NumberFieldOptions & StringFieldOptions) {}

  number() {
    this.decoratorsToApply.push(
      Type(() => Number),
      Min(this.options.min!, {
        message: validationI18nMessage("validation.min"),
      }),
      Max(this.options.max!, {
        message: validationI18nMessage("validation.max"),
      }),
    );

    return this;
  }

  string() {
    this.decoratorsToApply.push(
      IsString({
        each: this.options.each,
        message: validationI18nMessage("validation.isDataType", {
          type: "string",
        }),
      }),
    );

    return this;
  }

  enum(entity: Record<any, any>) {
    this.decoratorsToApply.push(
      IsEnum(entity, {
        each: this.options.each,
        message: `must be a valid enum value,${enumToString(entity)}`,
      }),
    );

    return this;
  }

  addSanitize() {
    if (this.options.sanitize) this.decoratorsToApply.push(Sanitize());

    return this;
  }

  addTrim() {
    if (this.options.trim) this.decoratorsToApply.push(Trim());

    return this;
  }

  addMinMaxLength() {
    if (this.options?.minLength && this.options?.maxLength) {
      MinMaxLength({
        each: this.options.each,
        maxLength: this.options.maxLength,
        minLength: this.options.minLength,
      });
    }

    return this;
  }

  addRequired() {
    if (this.options.required) {
      this.decoratorsToApply.push(
        IsNotEmpty({
          each: this.options.each,
          message: i18nValidationMessage("validation.isNotEmpty"),
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
