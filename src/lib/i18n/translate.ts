import type { I18nTranslations } from "@generated";
import type { Path, TranslateOptions } from "nestjs-i18n";
import { I18nContext, i18nValidationMessage } from "nestjs-i18n";

export const itemDoesNotExistKey: Path<I18nTranslations> = "exception.itemDoesNotExist";

export function translate(key: Path<I18nTranslations>, options: TranslateOptions = {}) {
  const i18nContext = I18nContext.current<I18nTranslations>();

  if (i18nContext)
    return i18nContext.t(key, options);

  // Handle the case when i18nContext is undefined
  return ""; // or throw an error, return a default value, etc.
}

export function validationI18nMessage(key: Path<I18nTranslations>, arguments_?: any) {
  return i18nValidationMessage(key, arguments_);
}
