import { IsStringField } from "@common/decorators/index.js";

export class MessageSeenDto {
  @IsStringField()
  receiver!: string;
}
