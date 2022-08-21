import { applyDecorators, Type } from "@nestjs/common";
import { ApiOkResponse, getSchemaPath } from "@nestjs/swagger";

export const ApiPaginatedResponse = <TModel extends Type<any>>(model: TModel) => {
	return applyDecorators(
		ApiOkResponse({
			description: "Successfully received model list",
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
