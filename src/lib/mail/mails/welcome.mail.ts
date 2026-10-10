import { Injectable } from "@nestjs/common";
import type { Mailable } from "@nestjs/mail";

export interface WelcomeMailData {
  firstName: string;
  link: string;
}

@Injectable()
export class WelcomeMail implements Mailable<WelcomeMailData> {
  render({ firstName, link }: WelcomeMailData) {
    return {
      subject: "Welcome to the app",
      template: "welcome",
      context: { firstName, link },
    };
  }
}
