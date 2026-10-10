import { PaginationType, QueryOrder } from "@common/@types";
import { IsEnumField, IsNumberField, IsStringField } from "@common/decorators";
import { ApiHideProperty } from "@nestjs/swagger";
import { Allow } from "class-validator";

import { PaginationDto } from "./pagination.dto";

export class OffsetPaginationDto extends PaginationDto {
  @ApiHideProperty()
  @Allow()
  type: PaginationType.OFFSET = PaginationType.OFFSET;

  /**
   * Results page you want to retrieve (0..N)
   */
  @IsNumberField({ required: false })
  readonly page = 1;

  /**
   * Number of results per page
   */
  @IsNumberField({ max: 50, required: false })
  readonly limit = 10;

  /**
   * Sorting order
   */
  @IsEnumField(QueryOrder, { required: false })
  readonly order: QueryOrder = QueryOrder.DESC;

  /**
   * Sorting criteria
   */
  @IsStringField({ maxLength: 50, required: false })
  readonly sort = "createdAt";

  get offset(): number {
    return (this.page - 1) * this.limit;
  }
}
