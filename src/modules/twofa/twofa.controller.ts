import { LoggedInUser } from "@common/decorators";
import { JwtAuthGuard } from "@common/guards";
import { User } from "@entities";
import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Post,
	Res,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { Response } from "express";
import { switchMap } from "rxjs";

import { CreateTwofaDto } from "./dto/create-twofa.dto";
import { TwoFactorAuthenticationService } from "./twofa.service";

@Controller("2fa")
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
	constructor(private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService) {}

	@Post("generate")
	@UseGuards(JwtAuthGuard)
	register(@Res() response: Response, @LoggedInUser() user: User) {
		this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(user).pipe(
			switchMap(({ otpAuthUrl }) => {
				return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpAuthUrl);
			}),
		);
	}

	@Post("turn-on")
	@UseGuards(JwtAuthGuard)
	turnOnTwoFactorAuthentication(
		@LoggedInUser() user: User,
		@Body() { twoFactorAuthenticationCode }: CreateTwofaDto,
	) {
		return this.twoFactorAuthenticationService.turnOnTwoFactorAuthentication(
			twoFactorAuthenticationCode,
			user,
		);
	}
}
