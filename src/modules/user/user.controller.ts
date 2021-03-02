import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import {
	Controller,
	Get,
	Post,
	Body,
	Put,
	Param,
	Delete,
	Inject,
	Logger,
	ParseUUIDPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
@Controller('user')
export class UserController {
	/**
	 * Creates an instance of UserController.
	 * @param {UserService} userService
	 * @memberof UserController
	 */
	constructor(
		private readonly userService: UserService,
		@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
	) {}
	/**
	 *
	 *
	 * @return {*}
	 * @memberof UserController
	 */

	/**
	 *
	 *
	 * @param {CreateUserDto} createUserDto
	 * @return {*}
	 * @memberof UserController
	 */
	@Post()
	create(@Body() createUserDto: CreateUserDto) {
		return this.userService.create(createUserDto);
	}

	/**
	 *
	 *
	 * @return {*}
	 * @memberof UserController
	 */
	@Get()
	async findAll() {
		return this.userService.findAll();
	}

	@Get(':idx')
	findOne(@Param('idx', ParseUUIDPipe) idx: string) {
		return this.userService.findOne(idx);
	}

	/**
	 *
	 *
	 * @param {string} id
	 * @param {UpdateUserDto} updateUserDto
	 * @return {*}
	 * @memberof UserController
	 */
	@Put(':idx')
	update(
		@Param('idx', ParseUUIDPipe) idx: string,
		@Body() updateUserDto: UpdateUserDto,
	): any {
		return this.userService.update(idx, updateUserDto);
	}

	/**
	 *
	 *
	 * @param {string} id
	 * @return {*}
	 * @memberof UserController
	 */
	@Delete(':idx')
	remove(@Param('idx', ParseUUIDPipe) idx: string) {
		return this.userService.remove(idx);
	}
}
