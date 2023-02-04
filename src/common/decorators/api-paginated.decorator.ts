import { applyDecorators, Type } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, getSchemaPath } from "@nestjs/swagger";

export const ApiPaginatedResponse = <TModel extends Type<any>>(
	model: TModel,
	operation: string,
) => {
	return applyDecorators(
		ApiOperation({ summary: operation }),
		ApiOkResponse({
			description: `Successfully received ${model.name.toLowerCase()} list`,
			schema: {
				allOf: [
					{
						properties: {
							itemCount: {
								type: "number",
								example: 10,
							},
							totalItems: {
								type: "number",
								example: 100,
							},
							itemsPerPage: {
								type: "number",
								example: 10,
							},
							totalPages: {
								type: "number",
								example: 5,
							},
							currentPage: {
								type: "number",
								example: 1,
							},
						},
					},
					{
						properties: {
							items: {
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
