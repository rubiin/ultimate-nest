import type { Loaded } from "@mikro-orm/postgresql";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import Strategy from "passport-magic-login";

import { EmailSubject, EmailTemplate } from "@common/@types";
import type { User } from "@entities";
import { MailerService } from "@lib/mailer/mailer.service";
import { AuthService } from "../auth.service";

interface MagicLoginPayload {
  destination: string
  code: string
  iat: number
  exp: number
}

@Injectable()
export class MagicLoginStrategy extends PassportStrategy(Strategy, "magicLogin") {
  /**
   * It's a PassportStrategy that uses the MagicLoginStrategy  to authenticate users
   * More at
   * https://www.passportjs.org/packages/passport-magic-login/
   *
   * The callback url should match whats specified in the callbackURL section
   *
   *
   */

  logger = new Logger(MagicLoginStrategy.name);

  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailerService,
    private readonly configService: ConfigService<Configs, true>,
    config: ConfigService<Configs, true>,
  ) {
    super({
      secret: config.get("jwt.secret", { infer: true }),
      jwtOptions: {
        expiresIn: config.get("jwt.magicLinkExpiry", { infer: true }),
      },
      algorithms: [config.get("jwt.algorithm", { infer: true })],
      // The authentication callback URL
      callbackUrl: "auth/magiclogin/callback",
      sendMagicLink: async (destination: string, href: string) => {
        this.logger.log(`Sending magic link to ${destination} with href ${href}`);

        return this.mailService.sendMail({
          template: EmailTemplate.MAGIC_LOGIN_TEMPLATE,
          replacements: {
            link: `${this.configService.get("app.url", { infer: true })}/v1/${href}`,
            expiry: this.configService.get("jwt.magicLinkExpiry", { infer: true }),
          },
          to: destination,
          subject: EmailSubject.MAGIC_LOGIN,
          from: this.configService.get("mail.senderEmail", { infer: true }),
        });
      },
      verify: (
        payload: MagicLoginPayload,
        callback: (callback_: undefined, user: Promise<Loaded<User>>) => void,
      ) => {
        // Get or create a user with the provided email from the database
        callback(undefined, this.validate(payload.destination));
      },
    });
  }

  /**
   *
   * Validate the token and return the user
   * @param email - The email of the user to validate
   */

  async validate(email: string) {
    // Accept the JWT and attempt to validate it using the user service
    return await this.authService.findUser({ email });
  }
}
