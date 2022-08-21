import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";

export function SwaggerDecorator({
	operation,
	notFound,
	badRequest,
	param,
}: {
	operation: string;
	notFound?: string;
	badRequest?: string;
	param?: string;
}) {
	const decsToApply = [ApiOperation({ summary: operation })];

	if (param) {
		decsToApply.push(ApiParam({ name: param, required: true, type: String }));
	}

	if (badRequest) {
		decsToApply.push(ApiResponse({ status: 400, description: badRequest }));
	}

	if (notFound) {
		decsToApply.push(ApiResponse({ status: 404, description: notFound }));
	}

	return applyDecorators(...decsToApply);
}
