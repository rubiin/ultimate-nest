import { IsOptional, IsString, Length } from "class-validator";
import { PaginationDto } from "./pagination.dto";

export abstract class SearchDto extends PaginationDto {

  @IsString()
  @Length(1, 100, {
    message: 'Search needs to be between 1 and 100 characters',
  })
  @IsOptional()
  public search?: string;
}
