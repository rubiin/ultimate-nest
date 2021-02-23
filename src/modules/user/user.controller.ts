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
} from '@nestjs/common';
import { UserService } from './user.service';
@Controller('user')
export class UserController {
	/**
	 * Creates an instance of UserController.
	 * @param {UserService} userService
	 * @memberof UserController
	 */
	constructor(private readonly userService: UserService) {}

	/**
	 *
	 *
	 * @return {*}
	 * @memberof UserController
	 */

	@Get('error')
	itThrows() {
		return this.userService.itThrows();
	}

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
	findAll() {
		return this.userService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.userService.findOne(+id);
	}

	/**
	 *
	 *
	 * @param {string} id
	 * @param {UpdateUserDto} updateUserDto
	 * @return {*}
	 * @memberof UserController
	 */
	@Put(':id')
	update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): any {
		return this.userService.update(+id, updateUserDto);
	}

	/**
	 *
	 *
	 * @param {string} id
	 * @return {*}
	 * @memberof UserController
	 */
	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.userService.remove(+id);
	}
}
