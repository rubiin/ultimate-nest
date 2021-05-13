import { LoggedInUser } from '@common/decorators/user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt.guard';
import { IResponse } from '@common/interfaces/response.interface';
import { User } from '@entities';
import { TokensService } from '@modules/token/tokens.service';
import {
	Body,
	Controller,
	ParseBoolPipe,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RefreshRequest } from './dtos/refresh-request.dto';
import { UserLoginDto } from './dtos/user-login';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly tokenService: TokensService,
	) {}

	@Post('login')
	async login(@Body() userLoginDto: UserLoginDto) {
		return this.authService.login(userLoginDto);
	}

	@Post('token/refresh')
	public async refresh(@Body() body: RefreshRequest): Promise<any> {
		const {
			token,
		} = await this.tokenService.createAccessTokenFromRefreshToken(
			body.refreshToken,
		);

		return {
			message: 'Operation Successful',
			accessToken: token,
		};
	}

	@UseGuards(JwtAuthGuard)
	@Post('logout')
	async logout(
		@LoggedInUser() user: User,
		@Body() refreshToken?: RefreshRequest,
		@Query('from_all', ParseBoolPipe) fromAll = false,
	): Promise<IResponse> {
		return fromAll
			? this.authService.logoutFromAll(user)
			: this.authService.logout(user, refreshToken.refreshToken);
	}
}
