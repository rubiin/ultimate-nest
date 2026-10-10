import { auditContext } from "@common/database/audit.context";
import { Injectable, NestMiddleware } from "@nestjs/common";

/**
 * Runs the rest of the request inside `auditContext`, so audit rows written during it can
 * read the actor, ip and request id.
 */
@Injectable()
export class AuditContextMiddleware implements NestMiddleware {
  use(request: NestifyRequest, _response: NestifyResponse, next: NestifyNextFunction) {
    auditContext.run(request, next);
  }
}
