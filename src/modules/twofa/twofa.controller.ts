import { AuthenticationResponse } from "@common/@types";
import { Auth, GenericController, LoggedInUser } from "@common/decorators";
import { User } from "@entities";
import { translate } from "@lib/i18n";
import { AuthService } from "@modules/auth/auth.service";
import { Body, Post, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Observable } from "rxjs";
import { switchMap, throwError } from "rxjs";

import { TwofaDto } from "./dtos/twofa.dto";
import { TwoFactorService } from "./twofa.service";

@GenericController("2fa", false)
export class TwoFactorController {
  constructor(
    private readonly twoFactorAuthenticationService: TwoFactorService,
    private readonly authService: AuthService,
  ) {}

  // Setup routes take a full access token: a password-only (partial) token must not be able to
  // set up or replace the second factor.
  @Auth()
  @Post("generate")
  @ApiOperation({ summary: "Generate a 2FA secret and return its QR code (PNG)" })
  @ApiConflictResponse({ description: "Two factor authentication is already enabled." })
  register(@Res() response: NestifyResponse, @LoggedInUser() user: User): Observable<unknown> {
    return this.twoFactorAuthenticationService.generateTwoFactorSecret(user).pipe(
      switchMap(({ otpAuthUrl }) => {
        return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpAuthUrl);
      }),
    );
  }

  @ApiBearerAuth()
  @Post("authenticate")
  @UseGuards(AuthGuard("jwt2fa"))
  @ApiOperation({
    summary: "Exchange the partial token from login and a TOTP code for the full token pair",
  })
  @ApiOkResponse({ type: AuthenticationResponse })
  @ApiUnauthorizedResponse({
    description: "Missing or invalid partial (2fa) token, or invalid authentication code.",
  })
  authenticate(
    @LoggedInUser() user: User,
    @Body()
    twoFaAuthDto: TwofaDto,
  ): Observable<AuthenticationResponse> {
    return this.twoFactorAuthenticationService.isTwoFactorCodeValid(twoFaAuthDto.code, user).pipe(
      switchMap((isCodeValid) => {
        if (!isCodeValid)
          return throwError(
            () => new UnauthorizedException(translate("exception.invalidTwoFaCode")),
          );

        return this.authService.issueTokens(user);
      }),
    );
  }

  @Auth()
  @Post("turn-on")
  turnOnTwoFactorAuthentication(
    @LoggedInUser() user: User,
    @Body()
    dto: TwofaDto,
  ): Observable<User> {
    return this.twoFactorAuthenticationService.turnOnTwoFactorAuthentication(dto.code, user);
  }
}
