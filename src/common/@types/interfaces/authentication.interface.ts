export interface OauthResponse {
  email: string;
  firstName: string;
  lastName: string;
  accessToken: string;
}

/**
 * What a JWT may be used for. All token types share secret, issuer and audience, so every consumer
 * must check this claim before trusting a token. A "2fa" token proves only the first factor
 * (password or OAuth) and can only be exchanged at `POST /2fa/authenticate`.
 */
export type TokenType = "access" | "refresh" | "2fa";

export interface JwtPayload {
  jti?: number;
  /** Absent on tokens issued before the claim existed; treat those as invalid. */
  type?: TokenType;
  sub: number;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
  isTwoFactorEnabled?: boolean;
  roles?: string[];
}
