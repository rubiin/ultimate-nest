import { IsBase64, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export abstract class PaginationDto {

  @IsString()
  @IsBase64()
  @IsOptional()
  public after?: string;

  @IsInt()
  @Min(1)
  @Max(50)
  public first = 10;

}
