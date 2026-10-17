import type { OauthResponse } from "@common/@types";
import type { ClientInfo } from "@common/@types";
import { AuthenticationResponse } from "@common/@types";
import { TWO_FACTOR_TOKEN_EXPIRY_MINUTES } from "@common/constant";
import {
  Auth,
  Client,
  GenericController,
  LoggedInUser,
  SwaggerResponse,
  UUIDParam,
} from "@common/decorators";
import { HelperService } from "@common/helpers";
import { User } from "@entities";
import { translate } from "@lib/i18n";
import { TokensService } from "@modules/token/tokens.service";
import {
  Body,
  BadRequestException,
  DefaultValuePipe,
  Delete,
  Get,
  ParseBoolPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Resilience } from "@nestjs/resilience";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { Observable } from "rxjs";
import { map } from "rxjs";

import { AuthService } from "./auth.service";
import {
  ChangePasswordDto,
  OtpVerifyDto,
  RefreshTokenDto,
  ResetPasswordDto,
  SendOtpDto,
  SessionResponseDto,
  UserLoginDto,
} from "./dtos";

@GenericController("auth", false)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokensService,
  ) {}

  @Post("login")
  @ApiOperation({ summary: "User Login" })
  @ApiOkResponse({
    description:
      "Full token pair. If the account has 2FA enabled, the response is instead " +
      "`{ user, accessToken, twoFactorRequired: true }` with no refresh token: `accessToken` is a " +
      `partial token valid for ${TWO_FACTOR_TOKEN_EXPIRY_MINUTES} minutes, accepted only by ` +
      "`POST /2fa/authenticate`.",
    type: AuthenticationResponse,
  })
  login(
    @Body() loginDto: UserLoginDto,
    @Client() client: ClientInfo,
  ): Observable<AuthenticationResponse> {
    return this.authService.login(loginDto, true, client);
  }

  @Post("reset-password")
  @SwaggerResponse({
    badRequest: "Otp is expired.",
    notFound: "Otp doesn't exist.",
    operation: "Reset password",
  })
  resetUserPassword(@Body() dto: ResetPasswordDto): Observable<User> {
    return this.authService.resetPassword(dto);
  }

  @Auth()
  @Patch("forgot-password")
  @SwaggerResponse({
    notFound: "Account doesn't exist.",
    operation: "Forgot password",
  })
  // Bounded because the whole handler is one mail send inside a transaction: a
  // stalled SMTP server must roll the OTP back rather than hang the caller.
  // Not retried - a second attempt would persist a second OTP.
  @Resilience("mail")
  forgotPassword(@Body() dto: SendOtpDto): Observable<{ message: string }> {
    return this.authService.forgotPassword(dto);
  }

  @Get("google")
  @UseGuards(AuthGuard("google"))
  googleAuth(@Req() _request: Request) {
    // the google auth redirect will be handled by passport
  }

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  googleAuthRedirect(
    @LoggedInUser()
    user: OauthResponse,
    @Res() response: NestifyResponse,
    @Client() client: ClientInfo,
  ) {
    return this.authService.OauthHandler({ client, response, user });
  }

  @Get("facebook")
  @UseGuards(AuthGuard("facebook"))
  facebookAuth(@Req() _request: Request) {
    // the facebook auth redirect will be handled by passport
  }

  @Get("facebook/callback")
  @UseGuards(AuthGuard("facebook"))
  facebookAuthRedirect(
    @LoggedInUser()
    user: OauthResponse,
    @Res() response: NestifyResponse,
    @Client() client: ClientInfo,
  ) {
    return this.authService.OauthHandler({ client, response, user });
  }

  // this simulates a frontend url for testing oauth login
  @Get("oauth/login")
  oauthMock(@Query() query: { token: string }) {
    return { message: "successfully logged", token: query.token };
  }

  @Post("verify-otp")
  @SwaggerResponse({
    badRequest: "Otp is expired.",
    notFound: "Otp doesn't exist.",
    operation: "Verify otp",
  })
  verifyOtp(@Body() dto: OtpVerifyDto): Observable<User> {
    return this.authService.verifyOtp(dto);
  }

  @Auth()
  @Post("change-password")
  @SwaggerResponse({
    badRequest: "Username and password provided does not match.",
    operation: "Change password",
  })
  changePassword(@Body() dto: ChangePasswordDto, @LoggedInUser() user: User): Observable<User> {
    return this.authService.changePassword(dto, user);
  }

  @ApiOperation({ summary: "Refresh token" })
  @Post("token/refresh")
  refresh(
    @Body() body: RefreshTokenDto,
    @Client() client: ClientInfo,
  ): Observable<AuthenticationResponse> {
    return this.tokenService
      .rotateRefreshToken(body.refreshToken, client)
      .pipe(
        map(({ user, accessToken, refreshToken }) =>
          HelperService.buildPayloadResponse(user, accessToken, refreshToken),
        ),
      );
  }

  @Auth()
  @ApiOperation({ summary: "Logout user" })
  @Post("logout")
  logout(
    @LoggedInUser() user: User,
    @Query("fromAll", new DefaultValuePipe(false), ParseBoolPipe)
    fromAll?: boolean,
    @Body()
    refreshToken?: RefreshTokenDto,
  ): Observable<User> {
    if (fromAll) return this.authService.logoutFromAll(user);

    // `refreshToken` is absent when the caller posts no body, so the non-null assertion
    // turned a missing field into a 500 rather than a 400.
    if (!refreshToken?.refreshToken)
      throw new BadRequestException(
        translate("validation.isNotEmpty", { args: { property: "refreshToken" } }),
      );

    return this.authService.logout(user, refreshToken.refreshToken);
  }

  @Auth()
  @ApiOperation({ summary: "List active sessions (refresh tokens) with device and IP" })
  @ApiOkResponse({ type: [SessionResponseDto] })
  @Get("sessions")
  sessions(@LoggedInUser() user: User): Observable<SessionResponseDto[]> {
    return this.tokenService
      .listSessions(user)
      .pipe(map((tokens) => tokens.map((token) => SessionResponseDto.from(token))));
  }

  @Auth()
  @ApiOperation({ summary: "Log out everywhere: revoke all of the user's sessions" })
  @Delete("sessions")
  revokeAllSessions(@LoggedInUser() user: User): Observable<void> {
    return this.authService.logoutFromAll(user).pipe(map(() => {}));
  }

  @Auth()
  @SwaggerResponse({ notFound: "Session doesn't exist.", operation: "Revoke one session" })
  @Delete("sessions/:id")
  revokeSession(@LoggedInUser() user: User, @UUIDParam("id") id: string): Observable<void> {
    return this.tokenService.revokeSession(user, id);
  }
}
