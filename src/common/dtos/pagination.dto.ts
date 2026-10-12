import { IsBooleanField, IsDateField, IsStringField } from "@common/decorators";
import { IsOptional } from "class-validator";

export abstract class PaginationDto {
  /**
   * From date filter
   */

  @IsOptional()
  @IsDateField()
  from?: Date;

  /**
   * From date filter
   */

  @IsOptional()
  @IsDateField()
  to?: Date;

  /**
   *  The search query
   */
  @IsStringField({ maxLength: 100, minLength: 1, required: false })
  search?: string;

  /**
   * The `withDeleted` property is a boolean flag that
   * indicates whether to include deleted items in the
   * results or not.
   */
  @IsBooleanField({ required: false })
  withDeleted = false;

  /**
   * The `relations` property is used to specify which related
   * entities should be included in the query
   * results.
   */
  @IsStringField({ each: true, required: false })
  relations: string[] = [];

  /**
   * The `fields` property is used to specify which
   * entities field should be included in the query
   * results.
   */
  @IsStringField({ each: true, required: false })
  fields: string[] = [];
}
