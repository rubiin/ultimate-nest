import type exception from "../../resources/i18n/en/exception.json";
import type validation from "../../resources/i18n/en/validation.json";

// Derived from the English catalogs, so keys cannot drift from the JSON.
export type I18nTranslations = {
  exception: typeof exception;
  validation: typeof validation;
};
