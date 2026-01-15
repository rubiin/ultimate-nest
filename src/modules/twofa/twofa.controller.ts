import  { AuthenticationResponse } from "@common/@types"
import  { User } from "@entities"
import  { AuthService } from "@modules/auth/auth.service"
import  { Observable } from "rxjs"

import  { TwofaDto } from "./dtos/twofa.dto"
import  { TwoFactorService } from "./twofa.service"
import { Auth, GenericController, LoggedInUser } from "@common/decorators"
import { Body, Post, Res, UnauthorizedException, UseGuards } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { ApiBearerAuth } from "@nestjs/swagger"
import { switchMap, throwError } from "rxjs"

@GenericController("2fa", false)
export class TwoFactorController {
  constructor(
    private readonly twoFactorAuthenticationService: TwoFactorService,
    private readonly authService: AuthService,
  ) {}

  @Post("generate")
  @UseGuards(AuthGuard("jwt2fa"))
  register(@Res() response: NestifyResponse, @LoggedInUser() user: User): Observable<unknown> {
    return this.twoFactorAuthenticationService.generateTwoFactorSecret(user).pipe(
      switchMap(({ otpAuthUrl }) => {
        return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpAuthUrl)
      }),
    )
  }

  @ApiBearerAuth()
  @Post("authenticate")
  @UseGuards(AuthGuard("jwt2fa"))
  authenticate(
    @LoggedInUser() user: User, @Body()
twoFaAuthDto: TwofaDto,
  ): Observable<AuthenticationResponse> {
  

    return this.twoFactorAuthenticationService.isTwoFactorCodeValid(
      twoFaAuthDto.code, user,
    ).pipe(
      switchMap((isCodeValid) => {
        if (!isCodeValid)
          return throwError(() => new UnauthorizedException())

        return this.authService.login(user, true)
      })
    )
  }

  @Auth()
  @Post("turn-on")
  turnOnTwoFactorAuthentication(
    @LoggedInUser() user: User, @Body()
dto: TwofaDto,
  ): Observable<User> {
    return this.twoFactorAuthenticationService.turnOnTwoFactorAuthentication(dto.code, user)
  }
}
