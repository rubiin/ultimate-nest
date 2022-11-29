import { Param, ParseUUIDPipe, PipeTransform, Type } from "@nestjs/common";

//eslint-disable-next-line unicorn/prevent-abbreviations
export function UUIDParam(
	property: string,
	...pipes: Array<Type<PipeTransform> | PipeTransform>
): ParameterDecorator {
	return Param(property, new ParseUUIDPipe({ version: "4" }), ...pipes);
}
