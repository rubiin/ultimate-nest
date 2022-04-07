import { LoggedInUser } from "@common/decorators/user.decorator";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { IResponse } from "@common/interfaces/response.interface";
import { User } from "@entities";
import { TokensService } from "@modules/token/tokens.service";
import { User as UserEntity } from "@entities";
import {
	Body,
	Controller,
	Get,
	ParseBoolPipe,
	Post,
	Query,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { RefreshRequest } from "./dtos/refresh-request.dto";
import { UserLoginDto } from "./dtos/user-login";
import { Auth } from "@common/decorators/auth.decorator";
import { LocalAuthGuard } from "@common/guards/local-auth.guard";

@ApiTags("Auth routes")
@Controller("auth")
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly tokenService: TokensService,
	) {}

	@UseGuards(LocalAuthGuard)
	@Post("login")
	async login(
		@Body() _loginDto: UserLoginDto,
		@LoggedInUser() user: UserEntity,
	) {
		const data = await this.authService.login(user);

		return {
			message: "Login Success",
			data,
		};
	}

	@ApiOperation({ summary: "Refresh token" })
	@Post("token/refresh")
	public async refresh(@Body() body: RefreshRequest): Promise<any> {
		const { token } =
			await this.tokenService.createAccessTokenFromRefreshToken(
				body.refreshToken,
			);

		return token;
	}

	@ApiOperation({ summary: "Logout user" })
	@UseGuards(JwtAuthGuard)
	@Post("logout")
	async logout(
		@LoggedInUser() user: User,
		@Body() refreshToken?: RefreshRequest,
		@Query("from_all", ParseBoolPipe) fromAll = false,
	): Promise<IResponse<any>> {
		return fromAll
			? this.authService.logoutFromAll(user)
			: this.authService.logout(user, refreshToken.refreshToken);
	}

	@Auth()
	@Get("profile")
	profile(@LoggedInUser() user: UserEntity) {
		return {
			message: "Fetched user profile",
			user,
		};
	}
}
