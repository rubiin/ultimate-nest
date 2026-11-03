import { PartialType } from "@nestjs/swagger";

import { CreateNewsletterDto } from "./create-newsletter.dto.js";

export class EditNewsletterDto extends PartialType(CreateNewsletterDto) {}
