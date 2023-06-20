import { CursorPaginationResponse, OffsetPaginationResponse } from "@common/@types";
import { applyDecorators, Type } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, ApiOperation, getSchemaPath } from "@nestjs/swagger";

export const ApiPaginatedResponse = <TModel extends Type>(model: TModel) => {
	return applyDecorators(
		ApiOperation({ summary: `${model.name.toLowerCase()} list` }),
		ApiExtraModels(CursorPaginationResponse, OffsetPaginationResponse, model),
		ApiOkResponse({
			description: `Successfully received ${model.name.toLowerCase()} list`,
			schema: {
				oneOf: [
					{
						allOf: [
							{ $ref: getSchemaPath(CursorPaginationResponse) },
							{
								properties: {
									data: {
										items: { $ref: getSchemaPath(model) },
									},
								},
							},
						],
					},
					{
						allOf: [
							{ $ref: getSchemaPath(OffsetPaginationResponse) },
							{
								properties: {
									data: {
										items: { $ref: getSchemaPath(model) },
									},
								},
							},
						],
					},
				],
			},
		}),
	);
};
