import { PartialType, OmitType } from "@nestjs/mapped-types";
import { CreatePostDto } from "./create-post.dto";

export class EditPostDto extends PartialType(
	OmitType(CreatePostDto, ["slug"] as const),
) {}
