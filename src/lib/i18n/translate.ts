import { I18nKey, I18nTranslateOptions, i18nValidationMessage, t } from "@nestjs/i18n";

export const itemDoesNotExistKey: I18nKey = "exception.itemDoesNotExist";

export function translate(key: I18nKey, options: I18nTranslateOptions = {}) {
  return t(key, options);
}

export function validationI18nMessage(key: I18nKey, arguments_?: Record<string, unknown>) {
  return i18nValidationMessage(key, arguments_);
}
