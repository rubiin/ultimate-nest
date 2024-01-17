import { ApiHideProperty } from "@nestjs/swagger";
import { Allow, IsBase64 } from "class-validator";
import { PaginationType } from "@common/@types";
import { IsNumberField, IsStringField } from "@common/decorators";
import { validationI18nMessage } from "@lib/i18n";
import { PaginationDto } from "./pagination.dto";

// TODO: add filters

export class CursorPaginationDto extends PaginationDto {
  @ApiHideProperty()
  @Allow()
    type: PaginationType.CURSOR = PaginationType.CURSOR;

  /**
   * The cursor of the page you are requesting
   */
  @IsStringField({ required: false })
  @IsBase64({},{

    message: validationI18nMessage("validation.isDataType", {
      type: "base64",
    }),
  })
    after?: string;

  /**
   * Results page you want to retrieve (0..N)
   */
  @IsNumberField({ required: false })
    first = 10;
}
