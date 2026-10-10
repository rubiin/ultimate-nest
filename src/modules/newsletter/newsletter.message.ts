/** Payload of a `SEND_NEWSLETTER` message: ids rather than data, so a stale copy is never mailed. */
export interface NewsLetterMessage {
  newsLetterIdx: string;
  subscriberIdx: string;
}
