interface BaseValidator {
	required?: boolean;
	each?: boolean;
	message?: string;
}

export interface IsStringFieldOptions extends BaseValidator {
	minLength?: number;
	maxLength?: number;
	sanitize?: boolean;
	trim?: boolean;
}

export interface IsNumberFieldOptions extends BaseValidator {
	min?: number;
	max?: number;
	int?: boolean;
	positive?: boolean;
}

export interface IsMinMaxLengthOptions
	extends Pick<IsStringFieldOptions, "each">,
		Pick<IsStringFieldOptions, "minLength" | "maxLength"> {}

export interface FileValidator {
	fileType?: RegExp | string;
	fileSize?: number;
	required?: boolean;
}

export interface IsDateFieldOptions extends BaseValidator {}

export interface IsEnumFieldOptions extends BaseValidator {}
