import { PickType } from "@nestjs/swagger";
import { IsEmpty, IsNotEmpty } from "class-validator";

export class OtpVerifyDto {
	@IsNotEmpty()
	otpCode!: string;

	@IsNotEmpty()
	@IsEmpty()
	email!: string;
}

export class SendOtpDto extends PickType(OtpVerifyDto, ["email"] as const) {}
