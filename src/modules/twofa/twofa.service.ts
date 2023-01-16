import { BaseRepository } from "@common/database";
import { User } from "@entities";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { authenticator } from "otplib";
import { toFileStream } from "qrcode";
import { from, map, Observable } from "rxjs";

@Injectable()
export class TwoFactorAuthenticationService {
	constructor(
		@InjectRepository(User)
		private userRepository: BaseRepository<User>,
		private readonly configService: ConfigService,
	) {}

	generateTwoFactorAuthenticationSecret(
		user: User,
	): Observable<{ secret: string; otpAuthUrl: string }> {
		const secret = authenticator.generateSecret();

		const otpAuthUrl = authenticator.keyuri(
			user.email,
			this.configService.get("app.name"),
			secret,
		);

		this.userRepository.assign(user, { twoFactorAuthenticationSecret: secret });

		return from(this.userRepository.flush()).pipe(
			map(() => {
				return { secret, otpAuthUrl };
			}),
		);
	}

	pipeQrCodeStream(stream: Response, otpAuthUrl: string) {
		return from(toFileStream(stream, otpAuthUrl));
	}

	isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, user: User): boolean {
		return authenticator.verify({
			token: twoFactorAuthenticationCode,
			secret: user.twoFactorAuthenticationSecret,
		});
	}

	turnOnTwoFactorAuthentication(
		twoFactorAuthenticationCode: string,
		user: User,
	): Observable<User> {
		const isCodeValid = this.isTwoFactorAuthenticationCodeValid(
			twoFactorAuthenticationCode,
			user,
		);

		if (!isCodeValid) {
			throw new UnauthorizedException("Wrong authentication code");
		}

		this.userRepository.assign(user, { isTwoFactorAuthenticationEnabled: true });

		return from(this.userRepository.flush()).pipe(map(() => user));
	}
}
