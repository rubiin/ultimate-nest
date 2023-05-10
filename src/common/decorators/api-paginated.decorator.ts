import { PaginationClass } from "@common/@types/pagination.class";
import { applyDecorators, Type } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, ApiOperation, getSchemaPath } from "@nestjs/swagger";

export const ApiPaginatedResponse = <TModel extends Type<unknown>>(
	model: TModel,
	operation: string,
) => {
	return applyDecorators(
		ApiOperation({ summary: operation }),
		ApiExtraModels(PaginationClass, model),
		ApiOkResponse({
			description: `Successfully received ${model.name.toLowerCase()} list`,
			schema: {
				allOf: [{ $ref: getSchemaPath(PaginationClass) }],
			},
		}),
	);
};
