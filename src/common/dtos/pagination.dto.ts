import { IsDateField, IsStringField, ToBoolean } from "@common/decorators";
import { IsBoolean, IsOptional } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

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
  @IsOptional()
  @ToBoolean()
  @IsBoolean({
    message: i18nValidationMessage("validation.isDataType", {
      type: "boolean",
    }),
  })
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
