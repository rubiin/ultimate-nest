import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UserRegistrationDto extends OmitType(CreateUserDto, [
	'roles',
] as const) {}
