import type { Request } from "express";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";
export const TWO_FACTOR_TOKEN_COOKIE = "two_factor_token";

export function authCookieOptions() {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export function extractCookie(request: Request, name: string): string | null {
  const header = request.headers.cookie;

  if (!header) return null;

  for (const part of header.split(";")) {
    const [key, ...value] = part.trim().split("=");

    if (key === name) return decodeURIComponent(value.join("="));
  }

  return null;
}
