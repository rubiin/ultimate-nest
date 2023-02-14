import { Auth, LoggedInUser } from "@common/decorators";
import { User } from "@entities";
import { AuthService } from "@modules/auth/auth.service";
import { Body, Controller, Post, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth } from "@nestjs/swagger";
import { Response } from "express";
import { switchMap } from "rxjs";

import { TwofaDto } from "./dtos/twofa.dto";
import { TwoFactorService } from "./twofa.service";

@Controller("2fa")
export class TwoFactorController {
	constructor(
		private readonly twoFactorAuthenticationService: TwoFactorService,
		private readonly authService: AuthService,
	) {}

	@Post("generate")
	@UseGuards(AuthGuard("jwt2fa"))
	register(@Res() response: Response, @LoggedInUser() user: User) {
		return this.twoFactorAuthenticationService.generateTwoFactorSecret(user).pipe(
			switchMap(({ otpAuthUrl }) => {
				return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpAuthUrl);
			}),
		);
	}

	// This function will be called if 2FA is on (activationOfTwoFa method)
	@ApiBearerAuth()
	@Post("authenticate")
	@UseGuards(AuthGuard("jwt2fa"))
	authenticate(@LoggedInUser() user: User, @Body() twoFaAuthDto: TwofaDto) {
		const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorCodeValid(
			twoFaAuthDto.code,
			user,
		);

		if (!isCodeValid) {
			throw new UnauthorizedException();
		}

		return this.authService.login(user, true);
	}

	@Auth()
	@Post("turn-on")
	turnOnTwoFactorAuthentication(@LoggedInUser() user: User, @Body() dto: TwofaDto) {
		return this.twoFactorAuthenticationService.turnOnTwoFactorAuthentication(dto.code, user);
	}
}
