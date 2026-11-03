import { IsStringField } from "@common/decorators/index.js";

export class CreateChatDto {
  @IsStringField()
  message!: string;

  @IsStringField({ required: false })
  to!: string;
}
