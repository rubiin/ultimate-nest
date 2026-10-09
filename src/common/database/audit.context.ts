import { AsyncLocalStorage } from "node:async_hooks";

export interface AuditActor {
  actorId: number | null;
  ip: string | null;
  requestId: string | null;
}

/**
 * Holds the current HTTP request for the lifetime of its async call chain, so `AuditSubscriber`
 * can attribute a flush without request-scoped providers. The request itself is stored (rather
 * than values copied out of it) because the user is attached by the auth guard, which runs
 * after middleware; reading at flush time sees it.
 */
export const auditContext = new AsyncLocalStorage<NestifyRequest>();

export function getAuditActor(): AuditActor {
  const request = auditContext.getStore();

  return {
    actorId: request?.user?.id ?? null,
    ip: request?.realIp ?? request?.ip ?? null,
    // pino-http's request id, so audit rows can be matched to the request log line.
    requestId: request?.id === undefined ? null : String(request.id),
  };
}
