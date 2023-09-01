import { Transform } from "class-transformer";
import DOMPurify from "isomorphic-dompurify";
import { isArray } from "helper-fns";

/**
 * It trims the value of a property and replaces multiple spaces with a single space
 * @returns A function that takes a parameter and returns a value.
 */
export const Trim = () => {
  return Transform((parameters) => {
    const value = parameters.value as string[] | string;

    if (isArray(value))
      return value.map((v: string) => v.trim().replaceAll(/\s\s+/g, " "));

    return value.trim().replaceAll(/\s\s+/g, " ");
  });
};

/**
 * It converts a string to a boolean
 * @returns A function that returns a PropertyDecorator
 */

export const ToBoolean = () => {
  return Transform(
    (parameters) => {
      switch (parameters.value) {
        case "true": {
          return true;
        }
        case "false": {
          return false;
        }
        default: {
          return parameters.value as boolean;
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

export const Sanitize = (): PropertyDecorator => {
  return Transform(
    ({ value }) => {
      if (isArray(value)) {
        return value.map((v) => {
          if (typeof v === "string") return DOMPurify.sanitize(v);

          return v;
        }) as string[];
      }

      if (typeof value === "string") return DOMPurify.sanitize(value);

      return value as string;
    },
    { toClassOnly: true },
  );
};
