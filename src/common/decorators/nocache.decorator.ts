import { SetMetadata } from "@nestjs/common";
/**
 * It sets a metadata key called "ignoreCaching" to true
 */
export const NoCache = () => SetMetadata("ignoreCaching", true);
