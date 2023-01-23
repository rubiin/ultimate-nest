import { Transform } from "class-transformer";
import DOMPurify from "isomorphic-dompurify";

/**
 * It trims the value of a property and replaces multiple spaces with a single space
 * @returns A function that takes a parameter and returns a value.
 */
export const Trim = (): PropertyDecorator => {
	return Transform(parameters => {
		const value = parameters.value as string[] | string;

		if (Array.isArray(value)) {
			return value.map((v: any) => v.trim().replaceAll(/\s\s+/g, " "));
		}

		return value.trim().replaceAll(/\s\s+/g, " ");
	});
};

/**
 * It converts a string to a boolean
 * @returns A function that returns a PropertyDecorator
 */

export const ToBoolean = (): PropertyDecorator => {
	return Transform(
		parameters => {
			switch (parameters.value) {
				case "true": {
					return true;
				}
				case "false": {
					return false;
				}
				default: {
					return parameters.value;
				}
			}
		},
		{ toClassOnly: true },
	);
};

/**
 * It takes a string, sanitizes it, and returns the sanitized string
 * @returns A decorator function that will be applied to the class.
 */

export const Sanitize = () => {
	return Transform(
		({ value }) => {
			if (Array.isArray(value)) {
				return value.map(v => DOMPurify.sanitize(v));
			}

			return DOMPurify.sanitize(value);
		},
		{ toClassOnly: true },
	);
};
