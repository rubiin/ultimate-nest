import type { Path, TranslateOptions } from "nestjs-i18n";
import { I18nContext, i18nValidationMessage } from "nestjs-i18n";

export function translate(key: Path<I18nTranslations>, options: TranslateOptions = {}) {
  return I18nContext.current<I18nTranslations>().t(key, options);
}

export function validationI18nMessage(key: Path<I18nTranslations>, arguments_?: any) {
  return i18nValidationMessage(key, arguments_);
}
