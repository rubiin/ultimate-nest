import { EmailTemplateEnum, IAuthenticationResponse } from "@common/@types";
import { BaseRepository } from "@common/database";
import { HelperService } from "@common/helpers";
import { OtpLog, User } from "@entities";
import { IConfig } from "@lib/config/config.interface";
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
import { capitalize, omit, randomString } from "helper-fns";
import { I18nContext } from "nestjs-i18n";
import { from, map, Observable, of, switchMap, zip } from "rxjs";

import {
	ChangePasswordDto,
	OtpVerifyDto,
	ResetPasswordDto,
	SendOtpDto,
	UserLoginDto,
} from "./dtos";

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: BaseRepository<User>,
		@InjectRepository(OtpLog)
		private readonly otpRepository: BaseRepository<OtpLog>,
		private readonly tokenService: TokensService,
		private readonly configService: ConfigService<IConfig, true>,
		private readonly mailService: MailerService,
		private readonly em: EntityManager,
	) {}

	/**
	 * It takes an email and a password, and returns the user if the password is correct
	 * @param {boolean} isPasswordLogin - boolean - This is a boolean value that determines whether the
	 * @param {string} email - The email address of the user.
	 * @param {string} pass - string - The password to be validated
	 * user is logging in with a password or not.
	 * @returns The user object without the password property.
	 */

	validateUser(isPasswordLogin: boolean, email: string, pass?: string): Observable<any> {
		return from(
			this.userRepository.findOne({
				email,
				isObsolete: false,
			}),
		).pipe(
			switchMap(user => {
				if (!user) {
					throw new ForbiddenException(
						I18nContext.current<I18nTranslations>()!.t("exception.itemDoesNotExist", {
							args: { item: "Account" },
						}),
					);
				}

				if (!user.isActive) {
					throw new ForbiddenException(
						I18nContext.current<I18nTranslations>()!.t("exception.inactiveUser"),
					);
				}

				return user && isPasswordLogin
					? HelperService.verifyHash(user.password, pass).pipe(
							map(isValid => {
								if (isValid) {
									return omit(user, ["password"]);
								}
								throw new BadRequestException(
									I18nContext.current<I18nTranslations>()!.t(
										"exception.invalidCredentials",
									),
								);
							}),
					  )
					: of(omit(user, ["password"]));
			}),
		);
	}

	/**
	 * We validate the user, if the user is valid, we generate an access token and a refresh token
	 * @param {UserLoginDto} loginDto - UserLoginDto - This is the DTO that we created earlier.
	 * @param {boolean} isPasswordLogin - boolean - This is a boolean value that tells the function whether
	 * the user is logging in with a password or oauth
	 * @returns An observable of type IAuthenticationResponse
	 */

	login(loginDto: UserLoginDto, isPasswordLogin = false): Observable<IAuthenticationResponse> {
		return this.validateUser(isPasswordLogin, loginDto.email, loginDto.password).pipe(
			switchMap(user => {
				if (!user)
					throw new UnauthorizedException(
						I18nContext.current<I18nTranslations>()!.t("exception.invalidCredentials"),
					);

				if (user.isTwoFactorEnabled) {
					return this.tokenService.generateAccessToken(user).pipe(
						map(accessToken => {
							return HelperService.buildPayloadResponse(user, accessToken);
						}),
					);
				}

				return zip(
					this.tokenService.generateAccessToken(user),
					this.tokenService.generateRefreshToken(
						user,
						this.configService.get("jwt.refreshExpiry", { infer: true }),
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
				I18nContext.current<I18nTranslations>()!.t("exception.itemDoesNotExist", {
					args: { item: "Account" },
				}),
			);
		}

		const otpNumber = randomString({ length: 6, numbers: true }); // random six digit otp

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
				from: this.configService.get("mail.senderEmail", { infer: true }),
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
	async verifyOtp(otpDto: OtpVerifyDto): Promise<User> {
		const { otpCode } = otpDto;
		const codeDetails = await this.otpRepository.findOne({
			otpCode,
		});

		if (!codeDetails) {
			throw new NotFoundException(
				I18nContext.current<I18nTranslations>()!.t("exception.itemDoesNotExist", {
					args: { item: "Otp" },
				}),
			);
		}

		const isExpired = isAfter(new Date(), new Date(codeDetails.expiresIn));

		if (isExpired) {
			throw new BadRequestException(
				I18nContext.current<I18nTranslations>()!.t("exception.itemExpired", {
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

		return codeDetails.user;
	}

	/**
	 * It takes a user and a DTO, then it checks if the current password is valid, if it is, it updates the
	 * password and returns the user
	 * @param {ChangePasswordDto} dto - ChangePasswordDto - This is the DTO that we created earlier.
	 * @param {User} user - User - The user object that is currently logged in.
	 * @returns Observable<User>
	 */
	changePassword(dto: ChangePasswordDto, user: User): Observable<User> {
		const { password, oldPassword } = dto;

		return from(
			this.userRepository.findOne({
				id: user.id,
			}),
		).pipe(
			switchMap(userDetails => {
				return HelperService.verifyHash(userDetails.password, oldPassword).pipe(
					switchMap(isValid => {
						if (!isValid) {
							throw new BadRequestException(
								I18nContext.current<I18nTranslations>()!.translate(
									"exception.invalidCredentials",
								),
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
