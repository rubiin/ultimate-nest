import process from "node:process";
import type { FilterQuery } from "@mikro-orm/postgresql";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager } from "@mikro-orm/postgresql";
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { init } from "@paralleldrive/cuid2";
import { isAfter } from "date-fns";
import { capitalize, omit } from "helper-fns";
import type { Observable } from "rxjs";
import { from, map, mergeMap, of, switchMap, throwError, zip } from "rxjs";

import type { AuthenticationResponse, OauthResponse } from "@common/@types";
import { EmailSubject, EmailTemplate } from "@common/@types";
import { BaseRepository } from "@common/database";
import { HelperService } from "@common/helpers";
import { OtpLog, Protocol, User } from "@entities";
import { itemDoesNotExistKey, translate } from "@lib/i18n";
import { MailerService } from "@lib/mailer/mailer.service";
import { TokensService } from "@modules/token/tokens.service";
import type {
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
    @InjectRepository(Protocol)
    private readonly protocolRepository: BaseRepository<Protocol>,
    @InjectRepository(OtpLog)
    private readonly otpRepository: BaseRepository<OtpLog>,
    private readonly tokenService: TokensService,
    private readonly configService: ConfigService<Configs, true>,
    private readonly mailService: MailerService,
    private readonly em: EntityManager,
  ) {}

  /**
   * It takes an email and a password, and returns the user if the password is correct
   * @param  isPasswordLogin - boolean - This is a boolean value that determines whether the
   * @param email - The email address of the user.
   * @param  pass - string - The password to be validated
   * user is logging in with a password or not.
   * @returns The user object without the password property.
   */

  validateUser(
    isPasswordLogin: boolean,
    email: string,
    pass?: string,
  ): Observable<any> {
    return from(
      this.userRepository.findOne({
        email,
      }),
    ).pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(
            () =>
              new ForbiddenException(
                translate(itemDoesNotExistKey, {
                  args: { item: "Account" },
                }),
              ),
          );
        }

        if (!user.isActive) {
          return throwError(
            () => new ForbiddenException(translate("exception.inactiveUser")),
          );
        }

        return user && isPasswordLogin
          ? HelperService.verifyHash(user.password, pass!).pipe(
            map((isValid) => {
              if (isValid)
                return omit(user, ["password"]);

              return throwError(
                () =>
                  new BadRequestException(
                    translate("exception.invalidCredentials"),
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
   * @param loginDto - UserLoginDto - This is the DTO that we created earlier.
   * @param isPasswordLogin - boolean - This is a boolean value that tells the function whether
   * the user is logging in with a password or oauth
   * @returns An observable of type IAuthenticationResponse
   */

  login(
    loginDto: UserLoginDto,
    isPasswordLogin = false,
  ): Observable<AuthenticationResponse> {
    return this.validateUser(
      isPasswordLogin,
      loginDto.email,
      loginDto.password,
    ).pipe(
      switchMap((user: User) => {
        if (!user) {
          return throwError(
            () =>
              new BadRequestException(
                translate("exception.invalidCredentials"),
              ),
          );
        }

        if (user.isTwoFactorEnabled) {
          return this.tokenService.generateAccessToken(user).pipe(
            map((accessToken) => {
              return HelperService.buildPayloadResponse(user, accessToken);
            }),
          );
        }

        return zip(
          this.userRepository.nativeUpdate(
            { id: user.id },
            { lastLogin: new Date() },
          ),
          this.tokenService.generateAccessToken(user),
          this.tokenService.generateRefreshToken(
            user,
            this.configService.get("jwt.refreshExpiry", { infer: true }),
          ),
        ).pipe(
          map(([_, accessToken, refreshToken]) => {
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
   * It deletes all refresh tokens for a given user
   * @param user - User - The user object that you want to logout from.
   * @returns Observable<any>
   */
  logoutFromAll(user: User): Observable<User> {
    return this.tokenService.deleteRefreshTokenForUser(user);
  }

  /**
   * We decode the refresh token, then delete the refresh token from the database
   * @param user - The user object that was returned from the login method.
   * @param refreshToken - The refresh token that was sent to the client.
   * @returns Observable of type User
   */
  logout(user: User, refreshToken: string): Observable<User> {
    return from(this.tokenService.decodeRefreshToken(refreshToken)).pipe(
      switchMap((payload) => {
        return this.tokenService.deleteRefreshToken(user, payload);
      }),
    );
  }

  /**
   * It creates a new OTP, sends it to the user's email, and returns the OTP
   * @param sendOtp - SendOtpDto
   * @returns Observable of type OtpLog
   */
  forgotPassword(sendOtp: SendOtpDto): Observable<{ message: string }> {
    const { email } = sendOtp;

    return from(
      this.userRepository.findOne({
        email,
      }),
    ).pipe(
      mergeMap((userExists) => {
        if (!userExists) {
          return throwError(
            () =>
              new NotFoundException(
                translate(itemDoesNotExistKey, {
                  args: { item: "Account" },
                }),
              ),
          );
        }

        return from(
          this.protocolRepository.findOne({
            isDeleted: false,
            isActive: true,
          }),
        ).pipe(
          switchMap((protocol) => {
            const otpNumber = init({ length: 6 })(); // random six digit otp

            const otp = this.otpRepository.create({
              user: userExists,
              otpCode: otpNumber,
              expiresIn: new Date(Date.now() + (protocol?.otpExpiryInMinutes ?? 5 * 60_000)), // prettier-ignore
            });

            return from(
              this.em.transactional(async (em) => {
                await em.persistAndFlush(otp);

                return this.mailService.sendMail({
                  template: EmailTemplate.RESET_PASSWORD_TEMPLATE,
                  replacements: {
                    firstName: capitalize(userExists.firstName),
                    lastName: capitalize(userExists.lastName),
                    otp: otpNumber,
                  },
                  to: userExists.email,
                  subject: EmailSubject.RESET_PASSWORD,
                  from: this.configService.get("mail.senderEmail", {
                    infer: true,
                  }),
                });
              }),
            ).pipe(map(() => ({ message: "Otp sent successfully" })));
          }),
        );
      }),
    );
  }

  /**
   * We are finding the user details from the OTP table using the OTP code and then updating the password
   * of the user in the user table
   * @param resetPassword - ResetPasswordDto
   * @returns Observable of type User
   */

  resetPassword(resetPassword: ResetPasswordDto): Observable<User> {
    const { password, otpCode } = resetPassword;

    return from(
      this.otpRepository.findOne(
        {
          otpCode,
        },
        { populate: ["user"] },
      ),
    ).pipe(
      switchMap((details) => {
        if (!details) {
          return throwError(
            () =>
              new NotFoundException(
                translate(itemDoesNotExistKey, {
                  args: { item: "Otp" },
                }),
              ),
          );
        }

        const user = details.user.getEntity();
        this.userRepository.assign(user, { password });

        return from(this.em.flush()).pipe(map(() => user));
      }),
    );
  }

  /**
   * This function verifies an OTP code and updates the user's verification status if the code is valid
   * and not expired.
   * @param otpDto - The `otpDto` parameter is an object of type `OtpVerifyDto` which
   * contains the OTP code that needs to be verified.
   * @returns The `verifyOtp` function returns an Observable of type `User`.
   */

  verifyOtp(otpDto: OtpVerifyDto): Observable<User> {
    const { otpCode } = otpDto;

    return from(
      this.otpRepository.findOne(
        {
          otpCode,
        },
        {
          populate: ["user"],
        },
      ),
    ).pipe(
      switchMap((codeDetails) => {
        if (!codeDetails) {
          return throwError(
            () =>
              new NotFoundException(
                translate(itemDoesNotExistKey, {
                  args: { item: "Otp" },
                }),
              ),
          );
        }

        const isExpired = isAfter(new Date(), new Date(codeDetails.expiresIn));

        if (isExpired) {
          return throwError(
            () =>
              new BadRequestException(
                translate("exception.itemExpired", {
                  args: { item: "Otp" },
                }),
              ),
          );
        }
        this.otpRepository.assign(codeDetails, {
          isUsed: true,
        });

        return from(
          this.em.transactional(async (em) => {
            await Promise.allSettled([
              em.nativeUpdate(
                User,
                {
                  id: codeDetails.user.id,
                },
                { isVerified: true },
              ),
              em.flush(),
            ]);
          }),
        ).pipe(map(() => codeDetails.user.getEntity()));
      }),
    );
  }

  /**
   * It takes a user and a DTO, then it checks if the current password is valid, if it is, it updates the
   * password and returns the user
   * @param dto - ChangePasswordDto - This is the DTO that we created earlier.
   * @param user - User - The user object that is currently logged in.
   * @returns Observable of type User
   */

  changePassword(dto: ChangePasswordDto, user: User): Observable<User> {
    const { password, oldPassword } = dto;

    return from(
      this.userRepository.findOne({
        id: user.id,
      }),
    ).pipe(
      switchMap((userDetails) => {
        if (!userDetails) {
          return throwError(
            () =>
              new NotFoundException(
                translate(itemDoesNotExistKey, {
                  args: { item: "Account" },
                }),
              ),
          );
        }

        return HelperService.verifyHash(userDetails.password, oldPassword).pipe(
          switchMap((isValid) => {
            if (!isValid) {
              return throwError(
                () =>
                  new BadRequestException(
                    translate("exception.invalidCredentials"),
                  ),
              );
            }
            this.userRepository.assign(userDetails, {
              password,
            });

            return from(this.em.flush()).pipe(map(() => userDetails));
          }),
        );
      }),
    );
  }

  /**
   * The function `findUser` searches for a user based on a given condition and returns the user if
   * found, otherwise it throws an UnauthorizedException.
   * @param condition - The `condition` parameter is a filter query that specifies the conditions to
   * match when searching for a user. It is used to filter the user records in the database and find a
   * specific user that meets the specified conditions.
   * @returns a Promise that resolves to a User object.
   */
  async findUser(condition: FilterQuery<User>): Promise<User> {
    const user = await this.userRepository.findOne(condition);

    if (!user)
      throw new UnauthorizedException();
    return user;
  }

  /**
   * The `OauthHandler` function handles the OAuth login process and redirects the user to the client URL
   * with the access token.
   * @returns a redirect response to a client URL with an access token as a query parameter.
   */
  OauthHandler({
    response,
    user,
  }: {
    response: NestifyResponse;
    user: OauthResponse;
  }) {
    return this.login({ email: user.email }, false).pipe(
      map((data) => {
        // client url
        return response.redirect(
          `${process.env.API_URL}/${process.env.APP_PORT}/v1/auth/oauth/login?token=${data.accessToken}`,
        );
      }),
    );
  }
}
