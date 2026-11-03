import { OmitType } from "@nestjs/swagger";

import { CreateUserDto } from "./create-user.dto.js";

export class UserRegistrationDto extends OmitType(CreateUserDto, ["roles"] as const) {}
