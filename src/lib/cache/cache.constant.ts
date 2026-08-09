import { ExecutionContext } from "@nestjs/common";

/**
 * Tag attached to every cached response of one controller, so a mutation
 * drops only that resource instead of flushing the whole cache.
 */
export function resourceCacheTag(context: ExecutionContext): string {
  const resource = context.getClass().name.replace(/Controller$/, "").toLowerCase();

  return `resource:${resource}`;
}

