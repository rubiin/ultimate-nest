import { Param, ParseUUIDPipe, PipeTransform, Type } from "@nestjs/common";

/**
 * It's a decorator that takes a property name and a list of pipes, and returns a decorator that takes
 * a class and a property name, and returns a decorator that takes a target, a property key, and a
 * parameter index, and returns a decorator that takes a target, a property key, and a parameter index
 * @param {string} property - The name of the property to bind the value to.
 * @param pipes - Array<Type<PipeTransform> | PipeTransform>
 * @returns A ParameterDecorator
 */
export const UUIDParam = (
	property: string,
	...pipes: Array<Type<PipeTransform> | PipeTransform>
): ParameterDecorator => {
	return Param(property, new ParseUUIDPipe({ version: "4" }), ...pipes);
};
