import { PartialType } from "@nestjs/swagger";

import { CreateTagDto } from "./create-tag.dto.js";

export class EditTagDto extends PartialType(CreateTagDto) {}
