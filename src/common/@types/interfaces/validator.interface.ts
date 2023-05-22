interface BaseValidator {
	required?: boolean;
	each?: boolean;
	message?: string;
}

export interface StringFieldOptions extends BaseValidator {
	minLength?: number;
	maxLength?: number;
	sanitize?: boolean;
	trim?: boolean;
}

export interface NumberFieldOptions extends BaseValidator {
	min?: number;
	max?: number;
	int?: boolean;
	positive?: boolean;
}

export interface MinMaxLengthOptions
	extends Pick<StringFieldOptions, "each">,
		Pick<StringFieldOptions, "minLength" | "maxLength"> {}

export interface FileValidator {
	fileType?: RegExp | string;
	fileSize?: number;
	required?: boolean;
}

export type DateFieldOptions = BaseValidator;

export type EnumFieldOptions = BaseValidator;
