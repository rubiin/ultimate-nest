interface IBaseValidator {
	required?: boolean;
	each?: boolean;
}

export interface IsStringFieldOptions extends IBaseValidator {
	minLength?: number;
	maxLength?: number;
	sanitize?: boolean;
	trim?: boolean;
}

export type IsEnumFieldOptions = IBaseValidator;

export interface IsNumberFieldOptions extends IBaseValidator {
	min?: number;
	max?: number;
	int?: boolean;
	positive?: boolean;
}

export interface IsMinMaxLengthOptions {
	min?: number;
	max?: number;
	each?: boolean;
}

export interface IFileValidator {
	fileType?: RegExp | string;
	fileSize?: number;
	required?: boolean;
}
