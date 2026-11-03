import { IsStringField } from "@common/decorators/index.js";

export class TwofaDto {
  /**
   * The code to verify
   * @example 123456
   */
  @IsStringField({ minLength: 1, required: true })
  code!: string;
}
