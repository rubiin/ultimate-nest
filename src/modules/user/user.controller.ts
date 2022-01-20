import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Param,
	Body,
	ParseUUIDPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dtos/create-user.dto';
import { EditUserDto } from './dtos/update-user.dto';

@ApiTags('Users routes')
@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@ApiOperation({ summary: 'Get all users' })
	@Get()
	async getManyUsers() {
		const data = await this.userService.getMany();

		return { message: 'Success', data };
	}

	@ApiOperation({ summary: 'Register user' })
	@Post('register')
	async publicRegistration(@Body() dto: CreateUserDto) {
		const data = await this.userService.createOne(dto);

		return { message: 'User registered', data };
	}

	@ApiOperation({ summary: 'Get a user' })
	@Get(':idx')
	async getOneUser(@Param('idx', ParseUUIDPipe) idx: string) {
		const data = await this.userService.getOneUser(idx);

		return { data };
	}

	@ApiOperation({ summary: 'Create user' })
	@Post()
	async createUser(@Body() dto: CreateUserDto) {
		const data = await this.userService.createOne(dto);

		return { message: 'User created', data };
	}

	@ApiOperation({ summary: 'Edit user' })
	@Put(':idx')
	async editUser(
		@Param('idx', ParseUUIDPipe) idx: string,
		@Body() dto: EditUserDto,
	) {
		const data = await this.userService.editOne(idx, dto);

		return { message: 'User edited', data };
	}

	@ApiOperation({ summary: 'Delete user' })
	@Delete(':idx')
	async deleteUser(@Param('idx', ParseUUIDPipe) idx: string) {
		const data = await this.userService.deleteUser(idx);

		return { message: 'User deleted', data };
	}
}
