import { OmitType, PartialType } from "@nestjs/swagger";

import { CreateUserDto } from "./create-user.dto.js";

export class EditUserDto extends PartialType(
  OmitType(CreateUserDto, ["username", "roles"] as const),
) {}
