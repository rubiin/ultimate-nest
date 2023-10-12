import { IsStringField } from "@common/decorators";

export class MessageSeenDto {
  @IsStringField()
    receiver!: string;
}
