import { PartialType } from "@nestjs/swagger";

import { CreatePostDto } from "./create-post.dto.js";

export class EditPostDto extends PartialType(CreatePostDto) {}
