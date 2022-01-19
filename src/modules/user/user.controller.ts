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
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dtos/create-user.dto';
import { EditUserDto } from './dtos/update-user.dto';

@ApiTags('Users routes')
@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	async getMany() {
		const data = await this.userService.getMany();

		return { data };
	}

	@Post('register')
	async publicRegistration(@Body() dto: CreateUserDto) {
		const data = await this.userService.createOne(dto);

		return { message: 'User registered', data };
	}

	@Get(':id')
	async getOne(@Param('id') id: number) {
		const data = await this.userService.getOne(id);

		return { data };
	}

	@Post()
	async createOne(@Body() dto: CreateUserDto) {
		const data = await this.userService.createOne(dto);

		return { message: 'User created', data };
	}

	@Put(':id')
	async editOne(@Param('id') id: number, @Body() dto: EditUserDto) {
		const data = await this.userService.editOne(id, dto);

		return { message: 'User edited', data };
	}

	@Delete(':id')
	async deleteOne(@Param('id') id: number) {
		const data = await this.userService.deleteOne(id);

		return { message: 'User deleted', data };
	}
}
