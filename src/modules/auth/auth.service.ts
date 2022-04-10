import { randomTypes } from "@common/constants/random-types.enum";
import { BaseRepository } from "@common/database/base.repository";
import { HelperService } from "@common/helpers/helpers.utils";
import { IResponse } from "@common/interfaces/response.interface";
import { OtpLog, User } from "@entities";
import { MailerService } from "@lib/mailer/mailer.service";
import { MikroORM, wrap } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { TokensService } from "@modules/token/tokens.service";
import {
	BadRequestException,
	ForbiddenException,
	HttpException,
	HttpStatus,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { capitalize, omit } from "@rubiin/js-utils";
import * as argon from "argon2";
import { isAfter } from "date-fns";
import { I18nRequestScopeService } from "nestjs-i18n";
import { OtpVerifyDto, SendOtpDto } from "./dtos/otp.dto";
import { ChangePasswordDto, ResetPasswordDto } from "./dtos/reset-password";

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: BaseRepository<User>,
		@InjectRepository(OtpLog)
		private readonly otpRepository: BaseRepository<OtpLog>,
		private readonly tokenService: TokensService,
		private readonly configService: ConfigService,
		private readonly mailService: MailerService,
		private readonly i18n: I18nRequestScopeService,
		private readonly orm: MikroORM,
	) {}

	async validateUser(email: string, pass: string): Promise<any> {
		const user = await this.userRepository.findOne({
			email,
			isObsolete: false,
		});

		if (!user) {
			throw new BadRequestException("Invalid credentials");
		}

		if (!user.isActive) {
			throw new ForbiddenException(
				"Account not found. Please create new account from the Login screen.",
			);
		}

		if (user && (await argon.verify(user.password, pass))) {
			return omit(user, ["password"]);
		}

		return null;
	}

	/**
	 *
	 *
	 * @param {UserLoginDto} userDto
	 * @return {Promise<IResponse<any>>}
	 * @memberof AuthService
	 */
	async login(user: User): Promise<any> {
		const token = await this.tokenService.generateAccessToken(user);
		const refresh = await this.tokenService.generateRefreshToken(
			user,
			this.configService.get<number>("jwt.refreshExpiry"),
		);

		const payload = HelperService.buildPayloadResponse(
			user,
			token,
			refresh,
		);

		return payload;
	}

	/**
	 *
	 * Logout the user from all the devices by invalidating all his refresh tokens
	 *
	 * @param {User} user
	 * @return {Promise<IResponse>}
	 * @memberof AuthService
	 */
	async logoutFromAll(user: User): Promise<IResponse<any>> {
		return this.tokenService.deleteRefreshTokenForUser(user);
	}

	/**
	 *
	 *
	 * @param {User} user
	 * @param {string} refreshToken
	 * @return {*}  {Promise<IResponse<any>>}
	 * @memberof AuthService
	 */
	async logout(user: User, refreshToken: string): Promise<IResponse<any>> {
		const payload = await this.tokenService.decodeRefreshToken(
			refreshToken,
		);

		return this.tokenService.deleteRefreshToken(user, payload);
	}

	async forgotPassword(sendOtp: SendOtpDto) {
		const { email } = sendOtp;
		const userExists = await this.userRepository.findOne({
			email,
			isObsolete: false,
		});

		if (!userExists) {
			throw new HttpException(
				await this.i18n.translate("operations.USER_NOT_FOUND"),
				HttpStatus.NOT_FOUND,
			);
		}

		const otpNumber = (await HelperService.getRandom(
			randomTypes.NUMBER,
			6,
		)) as string; // random six digit otp

		const otp = this.otpRepository.create({
			user: userExists,
			otpCode: otpNumber,
			expiresIn: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
		});

		await this.orm.em.transactional(async em => {
			await em.persistAndFlush(otp);

			await this.mailService.sendMail({
				template: "otp",
				replacements: {
					firstName: capitalize(userExists.firstName),
					lastName: capitalize(userExists.lastName),
					otp: otpNumber,
				},
				to: userExists.email,
			});
		});

		return otp;
	}

	async resetPassword(resetPassword: ResetPasswordDto) {
		const { password, otpCode } = resetPassword;
		const details = await this.otpRepository.findOne({
			otpCode,
		});

		return this.userRepository.nativeUpdate(
			{ id: details.user.id },
			{ password },
		);
	}

	async verifyOtp(otpDto: OtpVerifyDto) {
		const { otpCode } = otpDto;
		const codeDetails = await this.otpRepository.findOne({
			otpCode,
		});

		if (!codeDetails) {
			throw new NotFoundException(
				await this.i18n.translate("operations.OTP_NOT_FOUND"),
			);
		}

		const isExpired = isAfter(new Date(), new Date(codeDetails.expiresIn));

		if (isExpired) {
			throw new BadRequestException(
				await this.i18n.translate("operations.OTP_EXPIRED"),
			);
		}

		await this.orm.em.transactional(async em => {
			wrap(codeDetails).assign({
				isUsed: true,
			});

			em.nativeUpdate(
				User,
				{
					id: codeDetails.user.id,
				},
				{ isVerified: true },
			);

			em.flush();
		});
	}

	async changePassword(dto: ChangePasswordDto, user: User) {
		const { password, currentPassword } = dto;
		const userDetails = await this.userRepository.findOne({
			id: user.id,
		});

		const isValid = await argon.verify(
			userDetails.password,
			currentPassword,
		);

		if (!isValid) {
			throw new BadRequestException(
				await this.i18n.translate("operations.INVALID_PASSWORD"),
			);
		}

		wrap(userDetails).assign({
			password,
		});

		return this.userRepository.flush();
	}
}
