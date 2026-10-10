import { Injectable } from "@nestjs/common";
import type { Mailable } from "@nestjs/mail";

export interface ResetPasswordMailData {
  firstName: string;
  lastName: string;
  otp: string;
}

@Injectable()
export class ResetPasswordMail implements Mailable<ResetPasswordMailData> {
  render({ firstName, lastName, otp }: ResetPasswordMailData) {
    return {
      subject: "Reset your password",
      template: "reset",
      context: { firstName, lastName, otp },
    };
  }
}
