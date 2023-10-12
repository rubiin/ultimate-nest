import { IsStringField } from "@common/decorators";

export class TwofaDto {
  /**
   * The code to verify
   * @example 123456
   */
  @IsStringField({ minLength: 1, required: true })
    code!: string;
}
