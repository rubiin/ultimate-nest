import { getAuditActor } from "@common/database/audit.context";
import { mockResponse } from "@mocks";

import { AuditContextMiddleware } from "./audit-context.middleware";

describe("AuditContextMiddleware", () => {
  it("runs the rest of the request inside the audit context", async () => {
    const request = { id: 5, realIp: "203.0.113.9" } as NestifyRequest;
    let actorInHandler: ReturnType<typeof getAuditActor> | undefined;

    new AuditContextMiddleware().use(request, mockResponse, () => {
      // The guard attaches the user after middleware, and the handler then flushes later on.
      request.user = { id: 3 } as Express.User;
      setImmediate(() => {
        actorInHandler = getAuditActor();
      });
    });
    await new Promise((resolve) => setImmediate(resolve));

    expect(actorInHandler).toEqual({ actorId: 3, ip: "203.0.113.9", requestId: "5" });
    expect(getAuditActor()).toEqual({ actorId: null, ip: null, requestId: null });
  });
});
