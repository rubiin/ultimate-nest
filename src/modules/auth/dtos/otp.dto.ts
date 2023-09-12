import { PickType } from "@nestjs/swagger";
import { IsEmailField, IsStringField } from "@common/decorators";

export class OtpVerifyDto {
  /**
   * Otp sent on email
   * @example 986579
   */
  @IsStringField({
    minLength: 6,
    maxLength: 6,
  })
    otpCode!: string;

  /**
   * Email of user
   * @example someone@something.com
   */
  @IsEmailField()
    email!: string;
}

export class SendOtpDto extends PickType(OtpVerifyDto, ["email"] as const) {}
