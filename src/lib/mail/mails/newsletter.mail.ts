import { Injectable } from "@nestjs/common";
import type { Mailable } from "@nestjs/mail";

export interface NewsletterMailData {
  subject: string;
  content: string;
  unsubscribeUrl: string;
}

@Injectable()
export class NewsletterMail implements Mailable<NewsletterMailData> {
  render({ subject, content, unsubscribeUrl }: NewsletterMailData) {
    return {
      // One-click unsubscribe headers, so mail clients can offer their own button.
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
      },
      subject,
      template: "newsletter",
      context: { content, unsubscribeUrl },
    };
  }
}
