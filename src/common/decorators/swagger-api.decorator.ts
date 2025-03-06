import  { Type } from "@nestjs/common"
import { applyDecorators } from "@nestjs/common"
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger"

interface SwaggerResponseOptions<T = unknown, K = unknown> {
  operation: string
  params?: string[]
  notFound?: string
  badRequest?: string
  body?: Type<T>
  response?: Type<K>
}

export function SwaggerResponse(options_: SwaggerResponseOptions) {
  const options: SwaggerResponseOptions = { ...options_ }
  const decsToApply = [ApiOperation({ summary: options.operation })]

  if (options?.params != null) {
    for (const parameter of options.params)
      decsToApply.push(ApiParam({ name: parameter, required: true, type: String }))
  }

  if (options?.badRequest != null)
    decsToApply.push(ApiResponse({ status: 400, description: options.badRequest }))

  if (options?.notFound != null)
    decsToApply.push(ApiResponse({ status: 404, description: options.notFound }))

  if (options?.body != null)
    decsToApply.push(ApiBody({ type: options.body }))

  if (options?.response != null)
    decsToApply.push(ApiResponse({ type: options.response }))

  return applyDecorators(...decsToApply)
}
