import { I18nContext, i18nValidationMessage,Path, TranslateOptions } from "nestjs-i18n";


export const translate = (key: Path<I18nTranslations>, options: TranslateOptions = {}) =>
	I18nContext.current<I18nTranslations>().t(key, options);

export const validationI18nMessage = (key: Path<I18nTranslations>, arguments_?: any) =>
	i18nValidationMessage(key, arguments_);
