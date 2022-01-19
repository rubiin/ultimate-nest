import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Param,
	Body,
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
	async getMany() {
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
	@Get(':id')
	async getOne(@Param('id') id: number) {
		const data = await this.userService.getOne(id);

		return { data };
	}

	@ApiOperation({ summary: 'Create user' })
	@Post()
	async createOne(@Body() dto: CreateUserDto) {
		const data = await this.userService.createOne(dto);

		return { message: 'User created', data };
	}

	@ApiOperation({ summary: 'Edit user' })
	@Put(':id')
	async editOne(@Param('id') id: number, @Body() dto: EditUserDto) {
		const data = await this.userService.editOne(id, dto);

		return { message: 'User edited', data };
	}

	@ApiOperation({ summary: 'Delete user' })
	@Delete(':id')
	async deleteOne(@Param('id') id: number) {
		const data = await this.userService.deleteOne(id);

		return { message: 'User deleted', data };
	}
}
