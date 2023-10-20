import { IsStringField } from "@common/decorators";

export class ReferUserDto {
  @IsStringField()
  mobileNumber!: string;
}
