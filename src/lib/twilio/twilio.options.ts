import type { ClientOpts as IClientOptions } from "twilio";

export interface TwilioModuleOptions extends IClientOptions {
  accountSid: string
  authToken: string
  from: string
}
