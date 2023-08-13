import type { NextFunction, Request, Response } from 'express'
import { v4 as uuidv4, validate } from 'uuid'
import { REQUEST_ID_TOKEN_HEADER } from '@common/constant'

export const RequestIdMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction,
): void => {
  const requestId = request.header(REQUEST_ID_TOKEN_HEADER)

  if (!request.headers[REQUEST_ID_TOKEN_HEADER] || (requestId && !validate(requestId)))
    request.headers[REQUEST_ID_TOKEN_HEADER] = uuidv4()

  response.set(REQUEST_ID_TOKEN_HEADER, request.headers[REQUEST_ID_TOKEN_HEADER])
  next()
}
