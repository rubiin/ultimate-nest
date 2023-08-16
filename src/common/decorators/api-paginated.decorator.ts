import type { Type } from "@nestjs/common";
import { applyDecorators } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, ApiOperation, getSchemaPath } from "@nestjs/swagger";
import { CursorPaginationResponse, OffsetPaginationResponse } from "@common/@types";

export const ApiPaginatedResponse = <TModel extends Type>(model: TModel) => {
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
};
