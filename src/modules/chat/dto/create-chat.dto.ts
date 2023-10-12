import { IsStringField } from "@common/decorators";

export class CreateChatDto {
  @IsStringField()
    message!: string;

  @IsStringField({ required: false })
    to!: string;
}
