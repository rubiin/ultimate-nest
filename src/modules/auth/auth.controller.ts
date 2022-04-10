import { AppResource } from "@common/constants/app.roles";
import { Auth } from "@common/decorators/auth.decorator";
import { LoggedInUser } from "@common/decorators/user.decorator";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { LocalAuthGuard } from "@common/guards/local-auth.guard";
import { IResponse } from "@common/interfaces/response.interface";
import { User, User as UserEntity } from "@entities";
import { TokensService } from "@modules/token/tokens.service";
import {
	Body,
	Controller,
	Get,
	ParseBoolPipe,
	Post,
	Put,
	Query,
	UseGuards,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { OtpVerifyDto, SendOtpDto } from "./dtos/otp.dto";
import { RefreshRequest } from "./dtos/refresh-request.dto";
import { ChangePasswordDto, ResetPasswordDto } from "./dtos/reset-password";
import { UserLoginDto } from "./dtos/user-login";

@ApiTags("Auth routes")
@Controller("auth")
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly tokenService: TokensService,
	) {}

	@ApiOperation({ summary: "Login" })
	@UseGuards(LocalAuthGuard)
	@Post("login")
	@ApiBody({ type: UserLoginDto })
	async login(
		@Body() _loginDto: UserLoginDto,
		@LoggedInUser() user: UserEntity,
	) {
		return this.authService.login(user);
	}

	@ApiOperation({ summary: "Reset password" })
	@Post("reset-password")
	async resetUserPassword(@Body() dto: ResetPasswordDto) {
		return this.authService.resetPassword(dto);
	}

	@ApiOperation({ summary: "Forgot password" })
	@Put("forgot-password")
	async forgotPassword(@Body() dto: SendOtpDto) {
		return this.authService.forgotPassword(dto);
	}

	@ApiOperation({ summary: "Verify otp" })
	@Post("verify-otp")
	async verifyOtp(@Body() dto: OtpVerifyDto) {
		return this.authService.verifyOtp(dto);
	}

	@ApiOperation({ summary: "Change password" })
	@Auth({
		action: "update",
		possession: "own",
		resource: AppResource.USER,
	})
	@Post("change-password")
	async changePassword(
		@Body() dto: ChangePasswordDto,
		@LoggedInUser() user: UserEntity,
	) {
		return this.authService.changePassword(dto, user);
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

	@ApiOperation({ summary: "User profile" })
	@Auth()
	@Get("profile")
	profile(@LoggedInUser() user: UserEntity) {
		return user;
	}
}
