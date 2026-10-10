import { BaseRepository } from "@common/database";
import { User } from "@entities";
import { translate } from "@lib/i18n";
import { EntityManager } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { generateTOTP } from "@otplib/uri";
import { OTP } from "otplib";
import { toFileStream } from "qrcode";
import { Observable } from "rxjs";
import { from, map, of, switchMap, throwError } from "rxjs";

@Injectable()
export class TwoFactorService {
  private readonly otp: OTP;

  constructor(
    @InjectRepository(User)
    private userRepository: BaseRepository<User>,
    private readonly configService: ConfigService<Configs, true>,
    private readonly em: EntityManager<PostgreSqlDriver>,
  ) {
    this.otp = new OTP();
  }

  /**
   * It generates a secret, creates an OTP Auth URL, assigns the secret to the user, and flushes the user
   * repository
   * @param user - User - The user object that we want to generate the secret for.
   * @returns An Observable that returns an object with a secret and otpAuthUrl.
   */

  generateTwoFactorSecret(user: User): Observable<{ secret: string; otpAuthUrl: string }> {
    // Replacing the secret of an enabled factor would lock the user out of (or hand over) 2FA.
    if (user.isTwoFactorEnabled) {
      return throwError(
        () =>
          new ConflictException(
            translate("exception.itemExists", {
              args: { item: "Two factor authentication", property: "this account" },
            }),
          ),
      );
    }

    const secret = this.otp.generateSecret();

    const otpAuthUrl = generateTOTP({
      issuer: this.configService.get("app.name", { infer: true }),
      label: user.email,
      secret: secret,
    });

    this.userRepository.assign(user, { twoFactorSecret: secret });

    return from(this.em.flush()).pipe(
      map(() => {
        return { otpAuthUrl, secret };
      }),
    );
  }

  /**
   * It takes a response stream and an OTP Auth URL, and returns an observable that emits the file path
   * of the QR code image
   * @param stream - Response - The response from the HTTP request.
   * @param otpAuthUrl - The OTP Auth URL that you want to generate a QR code for.
   * @returns Observable<unknown>
   */
  pipeQrCodeStream(stream: NestifyResponse, otpAuthUrl: string): Observable<unknown> {
    stream.type("png");
    // `toFileStream` writes the PNG into the response and ends it; it returns nothing.
    toFileStream(stream, otpAuthUrl);

    return of(undefined);
  }

  /**
   * It returns true if the two factor authentication code is valid for the user, and false otherwise
   * @param twoFactorAuthenticationCode - The code that the user entered in the form.
   * @param user - The user object that we're checking the two factor authentication code for.
   * @returns A boolean value.
   */
  isTwoFactorCodeValid(twoFactorAuthenticationCode: string, user: User): Observable<boolean> {
    return from(
      this.otp.verify({
        secret: user.twoFactorSecret!,
        token: twoFactorAuthenticationCode,
      }),
    ).pipe(map((result) => result.valid));
  }

  /**
   * It takes a two factor authentication code and a user, checks if the code is valid, and if it is, it
   * enables two factor authentication for the user
   * @param twoFactorAuthenticationCode - The code that the user has entered in the form.
   * @param user - User - the user that is trying to turn on two factor authentication
   * @returns Observable<User>
   */
  turnOnTwoFactorAuthentication(twoFactorAuthenticationCode: string, user: User): Observable<User> {
    return this.isTwoFactorCodeValid(twoFactorAuthenticationCode, user).pipe(
      switchMap((isCodeValid) => {
        if (!isCodeValid) return throwError(() => new UnauthorizedException());

        this.userRepository.assign(user, { isTwoFactorEnabled: true });

        return from(this.em.flush()).pipe(map(() => user));
      }),
    );
  }
}
