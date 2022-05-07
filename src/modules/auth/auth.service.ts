import { BaseRepository } from "@common/database/base.repository";
import { HelperService } from "@common/helpers/helpers.utils";
import { OtpLog, User } from "@entities";
import { MailerService } from "@lib/mailer/mailer.service";
import { MikroORM, wrap } from "@mikro-orm/core";
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
import { capitalize, omit } from "helper-fns";
import { isAfter } from "date-fns";
import { I18nService } from "nestjs-i18n";
import { from, map, Observable, of, switchMap, zip } from "rxjs";
import { OtpVerifyDto, SendOtpDto } from "./dtos/otp.dto";
import { ChangePasswordDto, ResetPasswordDto } from "./dtos/reset-password";
import { UserLoginDto } from "./dtos/user-login";
import {
	RandomTypes,
	EmailTemplateEnum,
	LoginType,
} from "@common/constants/misc.enum";
import { IAuthenticationPayload } from "@common/interfaces/authentication.interface";

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
		private readonly orm: MikroORM,
	) {}

	validateUser(
		email: string,
		pass: string,
		loginType: LoginType,
	): Observable<any> {
		return from(
			this.userRepository.findOne({
				email,
				isObsolete: false,
			}),
		).pipe(
			switchMap(user => {
				if (!user) {
					throw new ForbiddenException(
						this.i18n.translate("status.ACCOUNT_NOT_FOUND"),
					);
				}

				if (!user.isActive) {
					throw new ForbiddenException(
						this.i18n.translate("status.ACCOUNT_NOT_FOUND"),
					);
				}

				return user && loginType === LoginType.PASSWORD
					? HelperService.verifyHash(user.password, pass).pipe(
							map(isValid => {
								if (isValid) {
									return omit(user, ["password"]);
								}
								throw new BadRequestException(
									this.i18n.translate(
										"status.USER_PASSWORD_DONT_MATCH",
									),
								);
							}),
					  )
					: of(omit(user, ["password"]));
			}),
		);
	}

	login(
		loginDto: UserLoginDto,
		loginType: LoginType,
	): Observable<IAuthenticationPayload> {
		return this.validateUser(
			loginDto.email,
			loginDto.password,
			loginType,
		).pipe(
			switchMap(user => {
				if (!user)
					throw new UnauthorizedException(
						this.i18n.translate("status.USER_PASSWORD_DONT_MATCH"),
					);

				return zip(
					this.tokenService.generateAccessToken(user),
					this.tokenService.generateRefreshToken(
						user,
						this.configService.get<number>("jwt.refreshExpiry"),
					),
				).pipe(
					map(([accessToken, refreshToken]) => {
						return HelperService.buildPayloadResponse(
							user,
							accessToken,
							refreshToken,
						);
					}),
				);
			}),
		);
	}

	/**
	 *
	 * Logout the user from all the devices by invalidating all his refresh tokens
	 *
	 * @param {User} user
	 * @return {Promise<IResponse>}
	 * @memberof AuthService
	 */
	logoutFromAll(user: User): Observable<any> {
		return from(this.tokenService.deleteRefreshTokenForUser(user));
	}

	logout(user: User, refreshToken: string): Observable<any> {
		return from(this.tokenService.decodeRefreshToken(refreshToken)).pipe(
			switchMap(payload => {
				return this.tokenService.deleteRefreshToken(user, payload);
			}),
		);
	}

	async forgotPassword(sendOtp: SendOtpDto): Promise<OtpLog> {
		const { email } = sendOtp;
		const userExists = await this.userRepository.findOne({
			email,
			isObsolete: false,
		});

		if (!userExists) {
			throw new NotFoundException(
				this.i18n.translate("operations.USER_NOT_FOUND"),
			);
		}

		const otpNumber = (await HelperService.getRandom(
			RandomTypes.NUMBER,
			6,
		)) as string; // random six digit otp

		const otp = this.otpRepository.create({
			user: userExists,
			otpCode: otpNumber,
			expiresIn: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
			isUsed: false,
		});

		await this.orm.em.transactional(async em => {
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

	resetPassword(resetPassword: ResetPasswordDto): Observable<any> {
		const { password, otpCode } = resetPassword;

		return from(
			this.otpRepository.findOne({
				otpCode,
			}),
		).pipe(
			switchMap(details => {
				return from(
					this.userRepository.nativeUpdate(
						{ id: details.user.id },
						{ password },
					),
				);
			}),
		);
	}

	async verifyOtp(otpDto: OtpVerifyDto) {
		const { otpCode } = otpDto;
		const codeDetails = await this.otpRepository.findOne({
			otpCode,
		});

		if (!codeDetails) {
			throw new NotFoundException(
				this.i18n.translate("operations.OTP_NOT_FOUND"),
			);
		}

		const isExpired = isAfter(new Date(), new Date(codeDetails.expiresIn));

		if (isExpired) {
			throw new BadRequestException(
				this.i18n.translate("operations.OTP_EXPIRED"),
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

	changePassword(dto: ChangePasswordDto, user: User): Observable<User> {
		const { password, currentPassword } = dto;

		return from(
			this.userRepository.findOne({
				id: user.id,
			}),
		).pipe(
			switchMap(userDetails => {
				return HelperService.verifyHash(
					userDetails.password,
					currentPassword,
				).pipe(
					map(isValid => {
						if (!isValid) {
							throw new BadRequestException(
								this.i18n.translate(
									"operations.INVALID_PASSWORD",
								),
							);
						}
						wrap(userDetails).assign({
							password,
						});

						this.userRepository.flush();

						return userDetails;
					}),
				);
			}),
		);
	}
}
