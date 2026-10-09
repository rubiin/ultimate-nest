export interface OauthResponse {
  email: string;
  firstName: string;
  lastName: string;
  accessToken: string;
}

/**
 * What a JWT may be used for. Access and refresh tokens share secret, issuer and audience, so
 * every consumer must check this claim before trusting a token.
 */
export type TokenType = "access" | "refresh";

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
