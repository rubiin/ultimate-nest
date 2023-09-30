import type { PipeTransform, Type } from "@nestjs/common";
import { HttpStatus, Param, ParseUUIDPipe } from "@nestjs/common";

/**
 * It's a decorator that takes a property name and a list of pipes, and returns a decorator that takes
 * a class and a property name, and returns a decorator that takes a target, a property key, and a
 * parameter index, and returns a decorator that takes a target, a property key, and a parameter index
 * @param property - The name of the property to bind the value to.
 * @returns A ParameterDecorator
 */

class CustomException extends Error {
  message = "UUID must be a valid UUID format (e.g. xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)";
  statusCode = HttpStatus.BAD_REQUEST;
}

const exceptionFactory = () => new CustomException();

export function UUIDParam(property: string, ...pipes: (Type<PipeTransform> | PipeTransform)[]): ParameterDecorator {
  return Param(property, new ParseUUIDPipe({ version: "4", exceptionFactory }), ...pipes);
}
