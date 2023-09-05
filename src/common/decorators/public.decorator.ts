import { SetMetadata, applyDecorators } from "@nestjs/common";
import { IS_PUBLIC_KEY_META, SWAGGER_API_SECURITY_KEY_META } from "@common/constant";

/**
 * It sets a metadata key called "isPublic" to true
 * @returns A function that sets a metadata key called "isPublic" to true
 */

const publicAuthMiddleware = SetMetadata(IS_PUBLIC_KEY_META, true);
const publicAuthSwagger = SetMetadata(SWAGGER_API_SECURITY_KEY_META, [IS_PUBLIC_KEY_META]);

export const Public = () => applyDecorators(publicAuthSwagger, publicAuthMiddleware);
