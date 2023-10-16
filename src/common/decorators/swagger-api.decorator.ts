import type { Type } from "@nestjs/common";
import { applyDecorators } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";

interface SwaggerResponseOptions<T, K> {
  operation: string
  params?: string[]
  notFound?: string
  badRequest?: string
  body?: Type<T>
  response?: Type<K>
}

export function SwaggerResponse({
  operation,
  notFound,
  badRequest,
  params,
  // @ts-expect-error - This is intentional
  body,
  // @ts-expect-error - This is intentional
  response,
}: SwaggerResponseOptions<typeof body, typeof response>) {
  const decsToApply = [ApiOperation({ summary: operation })];

  if (params) {
    for (const parameter of params)
      decsToApply.push(ApiParam({ name: parameter, required: true, type: String }));
  }

  if (badRequest)
    decsToApply.push(ApiResponse({ status: 400, description: badRequest }));

  if (notFound)
    decsToApply.push(ApiResponse({ status: 404, description: notFound }));

  if (body)
    decsToApply.push(ApiBody({ type: body }));

  if (response)
    decsToApply.push(ApiResponse({ type: response }));

  return applyDecorators(...decsToApply);
}
