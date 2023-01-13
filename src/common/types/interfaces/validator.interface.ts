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
