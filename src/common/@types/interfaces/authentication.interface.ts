export interface OauthResponse {
  email: string
  firstName: string
  lastName: string
  accessToken: string
}

export interface JwtPayload {
  jti?: number
  sub: number
  iat: number
  exp: number
  aud: string
  iss: string
  isTwoFactorEnabled?: boolean
  roles?: string[]
}
