import { LoggedInUser } from '@common/decorators/user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt.guard';
import { IResponse } from '@common/interfaces/response.interface';
import { User } from '@entities';
import { Controller, Delete, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProfileService } from './profile.service';

@UseGuards(JwtAuthGuard)
@ApiTags('Profile routes')
@Controller('profile')
export class ProfileController {
	constructor(private readonly profileService: ProfileService) {}

	@Get(':username')
	async findProfile(
		@Param('username') userName: string,
		@LoggedInUser() me: User,
	): Promise<IResponse<any>> {
		const data = await this.profileService.findProfile(userName, me);

		return { message: 'Success', data };
	}

	@Put(':username/follow')
	async followProfile(
		@Param('username') userName: string,
		@LoggedInUser() me: User,
	): Promise<IResponse<any>> {
		const data = await this.profileService.followProfile(userName, me);

		return { message: 'Success', data };
	}

	@Delete(':username/follow')
	async unFollowProfile(
		@Param('username') userName: string,
		@LoggedInUser() me: User,
	): Promise<IResponse<any>> {
		const data = await this.profileService.UnFollowProfile(userName, me);

		return { message: 'Success', data };
	}
}
