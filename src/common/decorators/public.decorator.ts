import { IS_PUBLIC_KEY_META } from "@common/constant";
import { applyDecorators, SetMetadata } from "@nestjs/common";

/**
 * It sets a metadata key called "isPublic" to true
 */

const PublicAuthMiddleware = SetMetadata(IS_PUBLIC_KEY_META, true);
const PublicAuthSwagger = SetMetadata("swagger/apiSecurity", [IS_PUBLIC_KEY_META]);

export const Public = () => applyDecorators(PublicAuthMiddleware, PublicAuthSwagger);
