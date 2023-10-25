import { TwilioModuleOptions } from "@lib/twilio/twilio.options";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { omit } from "helper-fns";
import type { Observable } from "rxjs";
import { catchError, from, tap, throwError } from "rxjs";
import twilio from "twilio";
import type {
  MessageInstance,
  MessageListInstanceCreateOptions,
} from "twilio/lib/rest/api/v2010/account/message";
import { MODULE_OPTIONS_TOKEN } from "./twilio.module-definition";

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly options: TwilioModuleOptions,
  ) {}

  /**
   * It takes in an options object, creates a Twilio client, and returns an observable of the message
   * instance
   * @param options - MessageListInstanceCreateOptions
   * @returns Observable<MessageInstance>
   */

  sendSms(
    options: MessageListInstanceCreateOptions & { prefix: string },
  ): Observable<MessageInstance> {
    const client = twilio(this.options.accountSid, this.options.authToken, omit(this.options, ["accountSid", "authToken", "from"]));

    return from(
      client.messages.create({
        ...options,
        from: this.options.from,
        to: `${options.prefix}${options.to}`,
      }),
    ).pipe(
      tap(message => this.logger.log(`SMS sent to ${message.sid}`)),
      catchError((error: Error) => {
        this.logger.error(error);

        return throwError(() => error);
      }),
    );
  }
}
