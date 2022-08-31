import { PartialType } from "@nestjs/swagger";
import { CreatePostDto } from "./create-post.dto";

export class EditPostDto extends PartialType(CreatePostDto) {}
