import { validationI18nMessage } from "@lib/i18n/index.js";
import { IsJWT, IsNotEmpty, IsOptional } from "class-validator";

export class RefreshTokenDto {
  /**
   * Refresh token of user
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
   */

  @IsOptional()
  @IsNotEmpty({ message: validationI18nMessage("validation.isNotEmpty") })
  @IsJWT({
    message: validationI18nMessage("validation.isDataType", {
      type: "jwt",
    }),
  })
  refreshToken?: string;
}
