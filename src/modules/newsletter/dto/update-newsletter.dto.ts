import { PartialType } from "@nestjs/swagger";

import { CreateNewsLetterDto } from "./create-newsletter.dto";

export class UpdateCreateNewsLetterDto extends PartialType(CreateNewsLetterDto) {}
