import { applyDecorators, SetMetadata } from "@nestjs/common";

/**
 * It sets a metadata key called "isPublic" to true
 */
export const IS_PUBLIC_KEY = "isPublic";

const PublicAuthMiddleware = SetMetadata(IS_PUBLIC_KEY, true);
const PublicAuthSwagger = SetMetadata("swagger/apiSecurity", ["isPublic"]);

export const Public = () => applyDecorators(PublicAuthMiddleware, PublicAuthSwagger);
