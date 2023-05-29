export const isUndefined = (value: unknown): value is undefined => {
	return value === undefined;
};

export const isNull = (value: unknown): value is null => value === null;

export const isArray = <T>(value: unknown): value is T[] => {
	return Array.isArray(value);
};
