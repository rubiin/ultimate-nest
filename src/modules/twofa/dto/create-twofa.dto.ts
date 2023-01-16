import { IsStringField } from "@common/decorators";

export class CreateTwofaDto {
	@IsStringField({ min: 1, required: true })
	twoFactorAuthenticationCode: string;
}
