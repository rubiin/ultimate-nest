import { IsStringField } from "@common/decorators";

export class TwofaDto {
	@IsStringField({ min: 1, required: true })
	code: string;
}
