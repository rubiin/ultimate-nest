import { IsStringField } from "@common/decorators/index.js";

export class ReferUserDto {
  @IsStringField()
  mobileNumber!: string;
}
