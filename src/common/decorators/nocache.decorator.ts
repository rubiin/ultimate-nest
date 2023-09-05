import { SetMetadata } from "@nestjs/common";
import { IGNORE_CACHING_META } from "@common/constant";

/**
 * It sets a metadata key called "ignoreCaching" to true
 * @returns A function that sets a metadata key called "ignoreCaching" to true
 */
export const NoCache = () => SetMetadata(IGNORE_CACHING_META, true);
