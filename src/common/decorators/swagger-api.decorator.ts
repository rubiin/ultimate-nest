import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";

interface SwaggerResponseOptions {
	operation: string;
	params?: string[];
	notFound?: string;
	badRequest?: string;
}

/**
 * It takes in a string for the operation summary, a string for the not found response, a string for
 * the bad request response, and an array of strings for the parameters, and returns a function that
 * applies the appropriate decorators to the class method
 * @param  - operation - The operation name
 * @returns A function that takes a class and returns a class.
 */
export const SwaggerResponse = ({
	operation,
	notFound,
	badRequest,
	params,
}: SwaggerResponseOptions) => {
	const decsToApply = [ApiOperation({ summary: operation })];

	if (params) {
		for (const parameter of params) {
			decsToApply.push(ApiParam({ name: parameter, required: true, type: String }));
		}
	}

	if (badRequest) {
		decsToApply.push(ApiResponse({ status: 400, description: badRequest }));
	}

	if (notFound) {
		decsToApply.push(ApiResponse({ status: 404, description: notFound }));
	}

	return applyDecorators(...decsToApply);
};
