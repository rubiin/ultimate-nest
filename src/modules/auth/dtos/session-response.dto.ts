import type { RefreshToken } from "@entities";

export class SessionResponseDto {
  /**
   * Session id, pass it to `DELETE /auth/sessions/:id` to revoke it
   * @example "0b5e0f6c-2d3a-4d0e-9a52-6e6d3b1f6c11"
   */
  id!: string;

  /**
   * IP address the session was started from
   * @example "203.0.113.7"
   */
  ipAddress?: string;

  /**
   * Device, as reported by the user agent header
   * @example "Mozilla/5.0 (X11; Linux x86_64) Firefox/130.0"
   */
  userAgent?: string;

  createdAt!: Date;

  expiresIn!: Date;

  static from(token: RefreshToken): SessionResponseDto {
    return {
      createdAt: token.createdAt!,
      expiresIn: token.expiresIn,
      id: token.idx!,
      ipAddress: token.ipAddress,
      userAgent: token.userAgent,
    };
  }
}
