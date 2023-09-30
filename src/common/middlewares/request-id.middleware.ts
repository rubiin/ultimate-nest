import { createId, isCuid } from "@paralleldrive/cuid2";
import type { NextFunction, Request, Response } from "express";
import { REQUEST_ID_TOKEN_HEADER } from "@common/constant";

export function RequestIdMiddleware(request: Request, response: Response, next: NextFunction): void {
  const requestId = request.header(REQUEST_ID_TOKEN_HEADER);

  if (!request.headers[REQUEST_ID_TOKEN_HEADER] || (requestId && !isCuid(requestId)))
    request.headers[REQUEST_ID_TOKEN_HEADER] = createId();

  response.set(REQUEST_ID_TOKEN_HEADER, request.headers[REQUEST_ID_TOKEN_HEADER]);
  next();
}
