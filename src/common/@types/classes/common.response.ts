export class AuthenticationResponse {
  /**
   * @example fb9eac5f-eb94-489b-8fca-24324558be18
   */
  user!: {
    idx?: string;
    id: number;
  };

  /**
   * @example eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXKYjj.eyJ
   */
  accessToken!: string;

  /**
   * @example eyJh3d06e6e3e152ae839a6623c3cb6f961a.eyJ
   */
  refreshToken?: string;

  /**
   * Present (true) only when the account has two factor authentication enabled. `accessToken` is
   * then a short-lived partial token that is accepted only by `POST /2fa/authenticate`, and no
   * refresh token is issued.
   * @example true
   */
  twoFactorRequired?: boolean;
}
