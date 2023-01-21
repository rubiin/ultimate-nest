interface IBaseValidator {
	required?: boolean;
	each?: boolean;
}

export interface IsStringFieldOptions extends IBaseValidator {
	min?: number;
	max?: number;
}

export type IsEnumFieldOptions = IBaseValidator;
export type IsNumberFieldOptions = IsStringFieldOptions;

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
