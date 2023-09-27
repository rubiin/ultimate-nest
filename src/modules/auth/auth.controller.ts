import { Request, Response } from "express";
import {
  Body,
  DefaultValuePipe,
  Get,
  ParseBoolPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiOperation } from "@nestjs/swagger";
import { Observable, map } from "rxjs";

import { TokensService } from "@modules/token/tokens.service";
import type { OtpLog } from "@entities";
import { User } from "@entities";
import { Auth, GenericController, LoggedInUser, SwaggerResponse } from "@common/decorators";
import type { AuthenticationResponse } from "@common/@types";
import { OauthResponse } from "@common/@types";
import { AuthService } from "./auth.service";
import {
  ChangePasswordDto,
  MagicLinkLogin,
  OtpVerifyDto,
  RefreshTokenDto,
  ResetPasswordDto,
  SendOtpDto,
  UserLoginDto,
} from "./dtos";
import { MagicLoginStrategy } from "./strategies";

@GenericController("auth", false)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokensService,
    private readonly magicStrategy: MagicLoginStrategy,
  ) {}

  @Post("login")
  @ApiOperation({ summary: "User Login" })
  login(@Body() loginDto: UserLoginDto): Observable<AuthenticationResponse> {
    return this.authService.login(loginDto);
  }

  @Post("login/magic")
  @ApiOperation({ summary: "User Login with magic link" })
  loginByMagicLink(
        @Req() request: Request,
        @Res() response: Response,
        @Body() dto: MagicLinkLogin,
  ): Observable<void> {
    return this.authService.validateUser(false, dto.destination).pipe(
      map((_user) => {
        this.magicStrategy.send(request, response);
      }),
    );
  }

  @Post("reset-password")
  @SwaggerResponse({
    operation: "Reset password",
    notFound: "Otp doesn't exist.",
    badRequest: "Otp is expired.",
  })
  resetUserPassword(@Body() dto: ResetPasswordDto): Observable<User> {
    return this.authService.resetPassword(dto);
  }

  @Auth()
  @Put("forgot-password")
  @SwaggerResponse({
    operation: "Forgot password",
    notFound: "Account doesn't exist.",
  })
  forgotPassword(@Body() dto: SendOtpDto): Observable<OtpLog> {
    return this.authService.forgotPassword(dto);
  }

  @UseGuards(AuthGuard("magicLogin"))
  @Get("magiclogin/callback")
  magicCallback(@LoggedInUser() user: User, @Res() response: Response) {
    return this.authService.login({ email: user.email }, false).pipe(
      map((data) => {
        // client url
        return response.redirect(
                    `${process.env.API_URL}/${process.env.APP_PORT}/v1/auth/oauth/login?token=${data.accessToken}`,
        );
      }),
    );
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
        @Res() response: Response,
  ) {
    return this.authService.login({ email: user.email }, false).pipe(
      map((data) => {
        // client url
        return response.redirect(
                    `${process.env.API_URL}/${process.env.APP_PORT}/v1/auth/oauth/login?token=${data.accessToken}`,
        );
      }),
    );
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
        @Res() response: Response,
  ) {
    return this.authService.login({ email: user.email }, false).pipe(
      map((data) => {
        // client url
        return response.redirect(
                    `${process.env.API_URL}/${process.env.APP_PORT}/v1/auth/oauth/login?token=${data.accessToken}`,
        );
      }),
    );
  }

  // this simulates a frontend url for testing oauth login
  @Get("oauth/login")
  oauthMock(@Query() query: { token: string }) {
    return { message: "successfully logged", token: query.token };
  }

  @Post("verify-otp")
  @SwaggerResponse({
    operation: "Verify otp",
    notFound: "Otp doesn't exist.",
    badRequest: "Otp is expired.",
  })
  verifyOtp(@Body() dto: OtpVerifyDto): Observable<User> {
    return this.authService.verifyOtp(dto);
  }

  @Auth()
  @Post("change-password")
  @SwaggerResponse({
    operation: "Change password",
    badRequest: "Username and password provided does not match.",
  })
  changePassword(@Body() dto: ChangePasswordDto, @LoggedInUser() user: User): Observable<User> {
    return this.authService.changePassword(dto, user);
  }

  @ApiOperation({ summary: "Refresh token" })
  @Post("token/refresh")
  refresh(@Body() body: RefreshTokenDto): Observable<any> {
    return this.tokenService
      .createAccessTokenFromRefreshToken(body.refreshToken)
      .pipe(map(token => ({ token })));
  }

  @Auth()
  @ApiOperation({ summary: "Logout user" })
  @Post("logout")
  logout(
        @LoggedInUser() user: User,
        @Query("from_all", new DefaultValuePipe(false), ParseBoolPipe) fromAll: boolean,
        @Body() refreshToken?: RefreshTokenDto,
  ): Observable<User> {
    return fromAll
      ? this.authService.logoutFromAll(user)
      : this.authService.logout(user, refreshToken.refreshToken);
  }
}
