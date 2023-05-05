
import { applyDecorators, Type } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";


// fix me

export const ApiPaginatedResponse = <TModel extends Type>(_model: TModel, operation: string) => {
	return applyDecorators(
		ApiOperation({ summary: operation }),
		// ApiExtraModels(IPaginated),
		// ApiOkResponse({
		// 	description: `Successfully received ${model.name.toLowerCase()} list`,
		// 	schema: {
		// 		allOf: [
		// 			{ $ref: getSchemaPath(IPaginated) },
		// 			{
		// 				properties: {
		// 					data: {
		// 						type: "array",
		// 						items: { $ref: getSchemaPath(model) },
		// 					},
		// 				},
		// 			},
		// 		],
		// 	},
		// }),
	);
};
