import { REQUEST_ID_TOKEN_HEADER } from "@common/constant"
import { createId, isCuid } from "@paralleldrive/cuid2"

export function RequestIdMiddleware(request: NestifyRequest, response: NestifyResponse, next: NestifyNextFunction) {
  const requestId = request.header(REQUEST_ID_TOKEN_HEADER)

  if (request.headers[REQUEST_ID_TOKEN_HEADER] === null || (requestId && !isCuid(requestId)))
    request.headers[REQUEST_ID_TOKEN_HEADER] = createId()

  response.set(REQUEST_ID_TOKEN_HEADER, request.headers[REQUEST_ID_TOKEN_HEADER])
  next()
}
