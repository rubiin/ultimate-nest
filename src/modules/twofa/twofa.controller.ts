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

import { CreateTwofaDto } from "./dto/create-twofa.dto";
import { TwoFactorAuthenticationService } from "./twofa.service";

@Controller("2fa")
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
	constructor(private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService) {}

	@Post("generate")
	@UseGuards(JwtAuthGuard)
	async register(@Res() response: Response, @LoggedInUser() user: User) {
		const { otpauthUrl } =
			await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(user);

		return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpauthUrl);
	}

	@Post("turn-on")
	@UseGuards(JwtAuthGuard)
	async turnOnTwoFactorAuthentication(
		@LoggedInUser() user: User,
		@Body() { twoFactorAuthenticationCode }: CreateTwofaDto,
	) {
		await this.twoFactorAuthenticationService.turnOnTwoFactorAuthentication(
			twoFactorAuthenticationCode,
			user,
		);
	}
}
