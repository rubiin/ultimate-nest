import { Injectable } from "@nestjs/common";
import type { Mailable } from "@nestjs/mail";

export interface VerifyEmailMailData {
  firstName: string;
  otp: string;
}

@Injectable()
export class VerifyEmailMail implements Mailable<VerifyEmailMailData> {
  render({ firstName, otp }: VerifyEmailMailData) {
    return {
      subject: "Verify your email address",
      template: "verify-email",
      context: { firstName, otp },
    };
  }
}
