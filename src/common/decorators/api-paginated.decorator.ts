import { Pagination } from "@lib/pagination";
import { applyDecorators, Type } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, ApiOperation, getSchemaPath } from "@nestjs/swagger";

export const ApiPaginatedResponse = <TModel extends Type>(model: TModel, operation: string) => {
	return applyDecorators(
		ApiOperation({ summary: operation }),
		ApiExtraModels(Pagination),
		ApiOkResponse({
			description: `Successfully received ${model.name.toLowerCase()} list`,
			schema: {
				allOf: [
					{ $ref: getSchemaPath(Pagination) },
					{
						properties: {
							data: {
								type: "array",
								items: { $ref: getSchemaPath(model) },
							},
						},
					},
				],
			},
		}),
	);
};
