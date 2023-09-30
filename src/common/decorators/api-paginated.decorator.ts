import type { Type } from "@nestjs/common";
import { applyDecorators } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, ApiOperation, getSchemaPath } from "@nestjs/swagger";
import { CursorPaginationResponse, OffsetPaginationResponse } from "@common/@types";

/**
 * The `ApiPaginatedResponse` function is a TypeScript function that generates decorators for Swagger
 * API documentation for paginated responses.
 * @param {TModel} model - The `model` parameter is a generic type that represents the type of the
 * model being paginated. It is used to generate the response schema for the paginated API endpoint.
 * @returns The function `ApiPaginatedResponse` returns a decorator that can be applied to an API
 * endpoint. The decorator adds Swagger documentation for a paginated response. The response schema
 * includes information about the pagination type (cursor or offset) and the data items returned.
 */

export function ApiPaginatedResponse<TModel extends Type>(model: TModel) {
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
}
