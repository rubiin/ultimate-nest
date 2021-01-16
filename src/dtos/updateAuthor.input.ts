import { InputType, PartialType } from "@nestjs/graphql";
import { CreateAuthorInput } from "./createAuthor.input";

@InputType()
export class UpdateAuthorInput extends PartialType(CreateAuthorInput) {}
