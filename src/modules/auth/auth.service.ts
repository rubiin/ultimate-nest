import { BaseRepository } from "@common/database/base.repository";
import { HelperService } from "@common/helpers/helpers.utils";
import { IAuthenticationPayload } from "@common/types";
import { EmailTemplateEnum, LoginType, RandomTypes } from "@common/types/enums/misc.enum";
import { OtpLog, User } from "@entities";
import { MailerService } from "@lib/mailer/mailer.service";
import { EntityManager } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { TokensService } from "@modules/token/tokens.service";
import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { isAfter } from "date-fns";
import { capitalize, omit } from "helper-fns";
import { I18nService } from "nestjs-i18n";
import { from, map, Observable, of, switchMap, zip } from "rxjs";

import { OtpVerifyDto, SendOtpDto } from "./dtos/otp.dto";
import { ChangePasswordDto, ResetPasswordDto } from "./dtos/reset-password";
import { UserLoginDto } from "./dtos/user-login";

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
		private readonly i18n: I18nService,
		private readonly em: EntityManager,
	) {}

	/**
	 * It takes an email, password, and login type, and returns an observable of the user if the user
	 * exists, is active, and the password is correct
	 * @param {string} email - The email address of the user
	 * @param {string} pass - string - The password that the user entered
	 * @param {LoginType} loginType - LoginType - This is an enum that we created in the auth.service.ts
	 * file.
	 * @returns return omit(user, ["password"]);
	 */
	validateUser(email: string, pass: string, loginType: LoginType): Observable<any> {
		return from(
			this.userRepository.findOne({
				email,
				isObsolete: false,
			}),
		).pipe(
			switchMap(user => {
				if (!user) {
					throw new ForbiddenException(
						this.i18n.t("exception.itemDoesNotExist", {
							args: { item: "Account" },
						}),
					);
				}

				if (!user.isActive) {
					throw new ForbiddenException(this.i18n.t("exception.inactiveUser"));
				}

				return user && loginType === LoginType.PASSWORD
					? HelperService.verifyHash(user.password, pass).pipe(
							map(isValid => {
								if (isValid) {
									return omit(user, ["password"]);
								}
								throw new BadRequestException(
									this.i18n.t("exception.invalidCredentials"),
								);
							}),
					  )
					: of(omit(user, ["password"]));
			}),
		);
	}

	/**
	 * It validates the user credentials, generates access and refresh tokens, and returns the payload
	 * @param {UserLoginDto} loginDto - UserLoginDto - This is the DTO that we created earlier.
	 * @param {LoginType} loginType - LoginType - This is an enum that we created to differentiate between
	 * the different types of login.
	 * @returns An observable of type IAuthenticationPayload
	 */
	login(loginDto: UserLoginDto, loginType: LoginType): Observable<IAuthenticationPayload> {
		return this.validateUser(loginDto.email, loginDto.password, loginType).pipe(
			switchMap(user => {
				if (!user)
					throw new UnauthorizedException(this.i18n.t("exception.invalidCredentials"));

				return zip(
					this.tokenService.generateAccessToken(user),
					this.tokenService.generateRefreshToken(
						user,
						this.configService.get<number>("jwt.refreshExpiry"),
					),
				).pipe(
					map(([accessToken, refreshToken]) => {
						return HelperService.buildPayloadResponse(user, accessToken, refreshToken);
					}),
				);
			}),
		);
	}

	/**
	 * It deletes all refresh tokens for a given user
	 * @param {User} user - User - The user object that you want to logout from.
	 * @returns Observable<any>
	 */
	logoutFromAll(user: User): Observable<User> {
		return this.tokenService.deleteRefreshTokenForUser(user);
	}

	/**
	 * We decode the refresh token, then delete the refresh token from the database
	 * @param {User} user - User - The user object that was returned from the login method.
	 * @param {string} refreshToken - The refresh token that was sent to the client.
	 * @returns Observable<any>
	 */
	logout(user: User, refreshToken: string): Observable<any> {
		return from(this.tokenService.decodeRefreshToken(refreshToken)).pipe(
			switchMap(payload => {
				return this.tokenService.deleteRefreshToken(user, payload);
			}),
		);
	}

	/**
	 * It creates a new OTP, sends it to the user's email, and returns the OTP
	 * @param {SendOtpDto} sendOtp - SendOtpDto
	 * @returns OtpLog
	 */
	async forgotPassword(sendOtp: SendOtpDto): Promise<OtpLog> {
		const { email } = sendOtp;
		const userExists = await this.userRepository.findOne({
			email,
			isObsolete: false,
		});

		if (!userExists) {
			throw new NotFoundException(
				this.i18n.t("exception.itemDoesNotExist", {
					args: { item: "Account" },
				}),
			);
		}

		const otpNumber = (await HelperService.getRandom(RandomTypes.NUMBER, 6)) as string; // random six digit otp

		const otpExpiry = 60 * 60 * 1000; // 1 hour

		const otp = this.otpRepository.create({
			user: userExists,
			otpCode: otpNumber,
			expiresIn: new Date(Date.now() + otpExpiry),
			isUsed: false,
		});

		await this.em.transactional(async em => {
			await em.persistAndFlush(otp);

			await this.mailService.sendMail({
				template: EmailTemplateEnum.RESET_PASSWORD_TEMPLATE,
				replacements: {
					firstName: capitalize(userExists.firstName),
					lastName: capitalize(userExists.lastName),
					otp: otpNumber,
				},
				to: userExists.email,
				subject: "Reset Password",
				from: this.configService.get("mail.senderEmail"),
			});
		});

		return otp;
	}

	/**
	 * We are finding the user details from the OTP table using the OTP code and then updating the password
	 * of the user in the user table
	 * @param {ResetPasswordDto} resetPassword - ResetPasswordDto
	 * @returns Observable<any>
	 */

	resetPassword(resetPassword: ResetPasswordDto): Observable<User> {
		const { password, otpCode } = resetPassword;

		return from(
			this.otpRepository.findOne({
				otpCode,
			}),
		).pipe(
			switchMap(details => {
				this.userRepository.assign(details.user, { password });

				return from(this.userRepository.flush()).pipe(map(() => details.user));
			}),
		);
	}

	/**
	 * It verifies the OTP code and marks the user as verified
	 * @param {OtpVerifyDto} otpDto - OtpVerifyDto - This is the DTO that we created earlier.
	 */
	async verifyOtp(otpDto: OtpVerifyDto) {
		const { otpCode } = otpDto;
		const codeDetails = await this.otpRepository.findOne({
			otpCode,
		});

		if (!codeDetails) {
			throw new NotFoundException(
				this.i18n.t("exception.itemDoesNotExist", {
					args: { item: "Otp" },
				}),
			);
		}

		const isExpired = isAfter(new Date(), new Date(codeDetails.expiresIn));

		if (isExpired) {
			throw new BadRequestException(
				this.i18n.t("exception.itemExpired", {
					args: { item: "Otp" },
				}),
			);
		}

		await this.em.transactional(async em => {
			this.otpRepository.assign(codeDetails, {
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

	/**
	 * It takes a user and a DTO, then it checks if the current password is valid, if it is, it updates the
	 * password and returns the user
	 * @param {ChangePasswordDto} dto - ChangePasswordDto - This is the DTO that we created earlier.
	 * @param {User} user - User - The user object that is currently logged in.
	 * @returns Observable<User>
	 */
	changePassword(dto: ChangePasswordDto, user: User): Observable<User> {
		const { password, currentPassword } = dto;

		return from(
			this.userRepository.findOne({
				id: user.id,
			}),
		).pipe(
			switchMap(userDetails => {
				return HelperService.verifyHash(userDetails.password, currentPassword).pipe(
					switchMap(isValid => {
						if (!isValid) {
							throw new BadRequestException(
								this.i18n.translate("exception.invalidCredentials"),
							);
						}
						this.userRepository.assign(userDetails, {
							password,
						});

						return from(this.userRepository.flush()).pipe(map(() => userDetails));
					}),
				);
			}),
		);
	}
}
