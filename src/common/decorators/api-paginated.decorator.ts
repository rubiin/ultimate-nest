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
							meta: {
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
					{
						properties: {
							links: {
								properties: {
									first: {
										type: "string",
										example: "posts?limit=10",
									},
									previous: {
										type: "string",
										example: "",
									},
									next: {
										type: "string",
										example: "",
									},
									last: {
										type: "string",
										example: "posts?page=1&limit=10",
									},
								},
							},
						},
					},
				],
			},
		}),
	);
};
