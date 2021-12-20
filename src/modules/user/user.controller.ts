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
import { RolesBuilder, InjectRolesBuilder } from 'nest-access-control';
import { UserRegistrationDto } from './dtos/user-registration.dto';
import { AppResource, AppRoles } from '@common/helpers/roles';
import { Auth } from '@common/decorators/auth.decorator';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoggedInUser } from '@common/decorators/user.decorator';
import { EditUserDto } from './dtos/update-user.dto';
import { User } from '@entities';

@ApiTags('Users routes')
@Controller('user')
export class UserController {
	constructor(
		private readonly userService: UserService,
		@InjectRolesBuilder()
		private readonly rolesBuilder: RolesBuilder,
	) {}

	@Get()
	async getMany() {
		const data = await this.userService.getMany();
		return { data };
	}

	@Post('register')
	async publicRegistration(@Body() dto: UserRegistrationDto) {
		const data = await this.userService.createOne({
			...dto,
			roles: [AppRoles.AUTHOR],
		});
		return { message: 'User registered', data };
	}

	@Get(':id')
	async getOne(@Param('id') id: number) {
		const data = await this.userService.getOne(id);
		return { data };
	}

	@Auth({
		possession: 'any',
		action: 'create',
		resource: AppResource.USER,
	})
	@Post()
	async createOne(@Body() dto: CreateUserDto) {
		const data = await this.userService.createOne(dto);
		return { message: 'User created', data };
	}

	@Auth({
		possession: 'own',
		action: 'update',
		resource: AppResource.USER,
	})
	@Put(':id')
	async editOne(
		@Param('id') id: number,
		@Body() dto: EditUserDto,
		@LoggedInUser() user: User,
	) {
		let data;

		if (
			this.rolesBuilder.can(user.roles).updateAny(AppResource.USER)
				.granted
		) {
			// esto es un admin
			data = await this.userService.editOne(id, dto);
		} else {
			// esto es un author
			const { roles, ...rest } = dto;
			data = await this.userService.editOne(id, rest, user);
		}
		return { message: 'User edited', data };
	}

	@Auth({
		action: 'delete',
		possession: 'own',
		resource: AppResource.USER,
	})
	@Delete(':id')
	async deleteOne(@Param('id') id: number, @LoggedInUser() user: User) {
		let data;

		if (
			this.rolesBuilder.can(user.roles).updateAny(AppResource.USER)
				.granted
		) {
			// else admin
			data = await this.userService.deleteOne(id);
		} else {
			// else author
			data = await this.userService.deleteOne(id, user);
		}
		return { message: 'User deleted', data };
	}
}
