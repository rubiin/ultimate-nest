import { PickType } from "@nestjs/swagger";
import { IsNotEmpty, Matches } from "class-validator";

export class OtpVerifyDto {
	@IsNotEmpty()
	otpCode!: string;

	@IsNotEmpty()
	@Matches(/^9(7|8)\d{8}$/)
	mobileNumber!: string;
}

export class SendOtpDto extends PickType(OtpVerifyDto, [
	"mobileNumber",
] as const) {}
