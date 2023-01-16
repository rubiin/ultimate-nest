import { BaseRepository } from "@common/database";
import { User } from "@entities";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { authenticator } from "otplib";
import { toFileStream } from "qrcode";

@Injectable()
export class TwoFactorAuthenticationService {
	constructor(
		@InjectRepository(User)
		private userRepository: BaseRepository<User>,
		private readonly configService: ConfigService,
	) {}

	async generateTwoFactorAuthenticationSecret(user: User) {
		const secret = authenticator.generateSecret();

		const otpauthUrl = authenticator.keyuri(
			user.email,
			this.configService.get("TWO_FACTOR_AUTHENTICATION_APP_NAME"),
			secret,
		);

		this.userRepository.assign(user, { twoFactorAuthenticationSecret: secret });

		await this.userRepository.flush();

		return {
			secret,
			otpauthUrl,
		};
	}

	async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
		return toFileStream(stream, otpauthUrl);
	}

	public isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, user: User) {
		return authenticator.verify({
			token: twoFactorAuthenticationCode,
			secret: user.twoFactorAuthenticationSecret,
		});
	}

	async turnOnTwoFactorAuthentication(twoFactorAuthenticationCode: string, user: User) {
		const isCodeValid = this.isTwoFactorAuthenticationCodeValid(
			twoFactorAuthenticationCode,
			user,
		);

		if (!isCodeValid) {
			throw new UnauthorizedException("Wrong authentication code");
		}

		this.userRepository.assign(user, { isTwoFactorAuthenticationEnabled: true });
		
return this.userRepository.flush();
	}
}
