import { PartialType } from "@nestjs/swagger";

import { CreateCategoryDto } from "./create-category.dto.js";

export class EditCategoryDto extends PartialType(CreateCategoryDto) {}
