import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";

export function SwaggerResponse({
	operation,
	notFound,
	badRequest,
	params,
}: {
	operation: string;
	notFound?: string;
	badRequest?: string;
	params?: string[];
}) {
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
}
