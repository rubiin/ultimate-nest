interface IBaseValidator {
	required?: boolean;
	each?: boolean;
	message?: string;
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

export interface IsMinMaxLengthOptions
	extends Pick<IsStringFieldOptions, "each">,
		Pick<IsStringFieldOptions, "minLength" | "maxLength"> {}

export interface IFileValidator {
	fileType?: RegExp | string;
	fileSize?: number;
	required?: boolean;
}
