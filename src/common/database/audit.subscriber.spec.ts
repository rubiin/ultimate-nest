import { AuditAction } from "@common/@types";
import { ChangeSetType, MikroORM, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";

import * as entities from "../../entities";
import { AuditLog, OtpLog, RefreshToken, User } from "../../entities";
import { auditContext } from "./audit.context";
import { AuditSubscriber, REDACTED } from "./audit.subscriber";

/**
 * Real flushes against a stubbed connection: the SQL is recorded instead of run, and the
 * `AuditLog` rows the subscriber adds to the flush are collected from the unit of work.
 */
describe("AuditSubscriber", () => {
  let orm: MikroORM;
  const queries: string[] = [];
  let audits: AuditLog[] = [];

  beforeAll(async () => {
    orm = await MikroORM.init({
      allowGlobalContext: true,
      connect: false,
      dbName: "audit_probe",
      driver: PostgreSqlDriver,
      entities: Object.values(entities).filter((value) => typeof value === "function") as never,
      implicitTransactions: false,
      metadataCache: { enabled: false },
      metadataProvider: TsMorphMetadataProvider,
      subscribers: [new AuditSubscriber()],
    });

    let nextId = 1;

    Object.assign(orm.em.getConnection(), {
      execute: async (query: string | { sql: string }) => {
        const sql = typeof query === "string" ? query : query.sql;

        queries.push(sql);

        if (!sql.startsWith("insert")) return { affectedRows: 1, rows: [] };

        const rows = (sql.match(/\), \(/g) ?? []).map(() => ({ id: nextId++ }));

        rows.push({ id: nextId++ });

        return { affectedRows: rows.length, insertId: rows[0].id, rows };
      },
    });
  }, 60_000);

  afterAll(async () => orm?.close());

  beforeEach(() => {
    queries.length = 0;
    audits = [];

    const computeChangeSet = orm.em.getUnitOfWork().computeChangeSet;

    vi.spyOn(Object.getPrototypeOf(orm.em.getUnitOfWork()), "computeChangeSet").mockImplementation(
      function (this: unknown, entity: unknown, type?: ChangeSetType) {
        if (entity instanceof AuditLog) audits.push(entity);

        return computeChangeSet.call(this, entity, type);
      },
    );
  });

  afterEach(() => vi.restoreAllMocks());

  const newUser = () =>
    Object.assign(new User(), {
      avatar: "avatar.png",
      bio: "bio",
      email: "ada@example.com",
      firstName: "Ada",
      lastName: "Lovelace",
      password: "secret",
      twoFactorSecret: "totp-seed",
      username: "ada",
    });

  it("records a create with the inserted payload, in the same flush", async () => {
    const em = orm.em.fork();
    const user = newUser();

    await em.persist(user).flush();

    expect(audits).toHaveLength(1);
    expect(audits[0]).toMatchObject({
      action: AuditAction.CREATE,
      entityId: user.idx,
      entityName: "User",
    });
    expect(audits[0].changes).toMatchObject({ firstName: "Ada", username: "ada" });
    expect(queries.some((sql) => sql.startsWith('insert into "audit_log"'))).toBe(true);
  });

  it("records an update as old/new pairs of the changed fields only", async () => {
    const em = orm.em.fork();
    const user = newUser();

    await em.persist(user).flush();
    audits = [];

    user.firstName = "Augusta";
    await em.flush();

    expect(audits).toHaveLength(1);
    expect(audits[0]).toMatchObject({ action: AuditAction.UPDATE, entityId: user.idx });
    expect(audits[0].changes).toMatchObject({ firstName: { new: "Augusta", old: "Ada" } });
    // `updatedAt` (second precision) only joins in when the flush crosses a second boundary.
    expect(Object.keys(audits[0].changes!).filter((key) => key !== "updatedAt")).toEqual([
      "firstName",
    ]);
  });

  it("records a delete with null changes", async () => {
    const em = orm.em.fork();
    const user = newUser();

    await em.persist(user).flush();
    audits = [];

    await em.remove(user).flush();

    expect(audits).toHaveLength(1);
    expect(audits[0]).toMatchObject({
      action: AuditAction.DELETE,
      changes: null,
      entityId: user.idx,
      entityName: "User",
    });
  });

  it("redacts password, hidden and other sensitive fields", async () => {
    const em = orm.em.fork();
    const user = newUser();

    await em.persist(user).flush();

    expect(audits[0].changes).toMatchObject({
      avatar: REDACTED,
      isDeleted: REDACTED,
      password: REDACTED,
      twoFactorSecret: REDACTED,
    });
    audits = [];

    user.password = "changed";
    await em.flush();

    expect(audits[0].changes).toMatchObject({ password: { new: REDACTED, old: REDACTED } });
    expect(JSON.stringify(audits[0].changes)).not.toContain("changed");
  });

  it("does not record AuditLog, RefreshToken or OtpLog rows", async () => {
    const em = orm.em.fork();
    const user = newUser();

    await em.persist(user).flush();
    audits = [];

    em.persist([
      new RefreshToken({ expiresIn: new Date(), user: user as never }),
      new OtpLog({ expiresIn: new Date(), otpCode: "123456", user: user as never }),
      Object.assign(new AuditLog(), { action: AuditAction.CREATE, entityId: "1", entityName: "X" }),
    ]);
    await em.flush();

    expect(audits.filter((audit) => audit.entityName !== "X")).toEqual([]);
  });

  // Collection changes reach the pivot table through collection updates, not change sets, so
  // a pivot change set only appears when a pivot entity is persisted directly.
  it("does not record pivot table rows", () => {
    const pivot = [...orm.getMetadata().getAll().values()].find((meta) => meta.pivotTable)!;
    const computeChangeSet = vi.fn();

    new AuditSubscriber().onFlush({
      em: orm.em.fork(),
      uow: {
        computeChangeSet,
        getChangeSets: () => [
          {
            entity: {},
            getSerializedPrimaryKey: () => "1",
            meta: pivot,
            payload: { follower: 2, following: 1 },
            type: ChangeSetType.CREATE,
          },
        ],
      },
    } as never);

    expect(computeChangeSet).not.toHaveBeenCalled();
  });

  it("takes actor, ip and request id from the request context", async () => {
    const em = orm.em.fork();
    const request = { id: 42, realIp: "203.0.113.9", user: { id: 7 } } as NestifyRequest;

    await auditContext.run(request, async () => em.persist(newUser()).flush());

    expect(audits[0]).toMatchObject({ actorId: 7, ip: "203.0.113.9", requestId: "42" });
  });

  it("leaves actor fields null outside a request", async () => {
    await orm.em.fork().persist(newUser()).flush();

    expect(audits[0]).toMatchObject({ actorId: null, ip: null, requestId: null });
  });
});
