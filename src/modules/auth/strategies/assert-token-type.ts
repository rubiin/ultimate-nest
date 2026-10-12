import { JwtPayload } from "@common/@types";
import { UnauthorizedException } from "@nestjs/common";

/**
 * Access, refresh and 2fa tokens verify against the same secret, so a valid signature is not
 * on its own a bearer credential. Every strategy therefore has to assert the `type` claim it
 * expects before treating the token as one.
 * @param payload The decoded token payload.
 * @param expected The `type` claim the calling strategy accepts.
 */
export const assertTokenType = (payload: JwtPayload, expected: JwtPayload["type"]) => {
  if (payload.type !== expected) throw new UnauthorizedException();
};
