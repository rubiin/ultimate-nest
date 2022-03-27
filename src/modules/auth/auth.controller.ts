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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RefreshRequest } from './dtos/refresh-request.dto';
import { UserLoginDto } from './dtos/user-login';

@ApiTags('Auth routes')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly tokenService: TokensService,
	) {}

	@ApiOperation({ summary: 'Login user' })
	@Post('login')
	async login(@Body() userLoginDto: UserLoginDto) {
		return this.authService.login(userLoginDto);
	}

	@ApiOperation({ summary: 'Refresh token' })
	@Post('token/refresh')
	public async refresh(@Body() body: RefreshRequest): Promise<any> {
		const { token } =
			await this.tokenService.createAccessTokenFromRefreshToken(
				body.refreshToken,
			);

		return token;
	}

	@ApiOperation({ summary: 'Logout user' })
	@UseGuards(JwtAuthGuard)
	@Post('logout')
	async logout(
		@LoggedInUser() user: User,
		@Body() refreshToken?: RefreshRequest,
		@Query('from_all', ParseBoolPipe) fromAll = false,
	): Promise<IResponse<any>> {
		return fromAll
			? this.authService.logoutFromAll(user)
			: this.authService.logout(user, refreshToken.refreshToken);
	}
}
