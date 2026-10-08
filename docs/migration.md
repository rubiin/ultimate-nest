# NestJS 12 Migration Notes

Findings from auditing this repository against NestJS 12 (`@nestjs/*` 12.x) — libraries that Nest now
ships natively, v12 features worth adopting, and breaking changes that were assessed as
not applicable.

Versions these notes were verified against: `@nestjs/common` 12.1.2, `@nestjs/core` 12.1.2,
`@nestjs/platform-express` 12.1.2, `@nestjs/config` 12.0.1, `@nestjs/cli` 12.0.8, Node 24.21.0.
Everything below was read out of `node_modules/@nestjs/*` and the v12.0.0 / v12.1.x release notes,
not from memory.

For a per-item tracker against the official guide, see
[migration-checklist.md](./migration-checklist.md).

## Status

| Change                                                                                        | Status                 |
| --------------------------------------------------------------------------------------------- | ---------------------- |
| Config validation: Joi → Zod via Standard Schema                                              | Done, all gates green  |
| `helmet` → built-in `app.useSecurityHeaders()`                                                | Done, all gates green  |
| `body-parser` → built-in `app.useBodyParser()`                                                | Done, all gates green  |
| `cache-manager` type import → `@nestjs/cache-manager`                                         | Done, all gates green  |
| Prune `helmet`, `url-minify`, `@nestjs/mapped-types`, `passport-magic-login`, `cache-manager` | Done, all gates green  |
| Route conflict diagnostics enabled in `main.ts`                                               | Done, all gates green  |
| Lifecycle-hook ordering reviewed                                                              | Done, no change needed |

All gates green as of this writing: `pnpm build` clean, `pnpm test` 49 files / 286 passed / 1
skipped, `pnpm lint` with only the pre-existing `src/modules/auth/auth.service.ts:130` warning,
`pnpm format:check` clean.

**Not verified:** `pnpm test:e2e` has never been run against a live database, so the
`useSecurityHeaders()` swap, the new 10mb body limit and the route conflict policy have only been
checked at compile and unit-test level. In particular `routeConflictPolicy: { duplicate: "error" }`
throws at bootstrap if two identical routes exist, and that cannot be confirmed without booting the
app. Run `just test-e2e` before merging.

## Libraries Nest 12 now provides

### `helmet` → `app.useSecurityHeaders()`

Implemented in `@nestjs/core` (`nest-application.js:270`) and exposed on `INestApplication`
(`nest-application.d.ts:50`). The option type documents itself as a drop-in:

> Each key controls one header and accepts `false` to leave that header out, `true` for its default
> value (**the same defaults as helmet 8**), or an object to configure it. **Option names match
> helmet's, so existing helmet configurations carry over.**

`src/main.ts` called `helmet()` with no arguments, so `app.useSecurityHeaders()` is equivalent
inside the existing `if (!HelperService.isProd())` guard. Unlike the `helmet()` middleware it is
adapter-agnostic, working through a security hook rather than Express.

Removes the `helmet` dependency.

### `body-parser` → `app.useBodyParser()`

`NestExpressApplication.useBodyParser('json' | 'urlencoded', options)`
(`nest-express-application.interface.d.ts:94`) wraps `express.json`/`express.urlencoded` and
respects the application's `rawBody` option.

Two problems were found here, only one of which is a Nest concern:

1. **`body-parser` was never declared in `package.json`.** `src/main.ts` imported it directly and it
   only resolved because `pnpm-workspace.yaml` sets `shamefullyHoist: true`. It resolved to a
   transitive `body-parser@2.3.0` that would disappear whenever that transitive dep changed.
2. **The 10mb limit was dead code.** `registerParserMiddleware`
   (`express-adapter.js:241`) runs during `NestFactory.create()` and registers `jsonParser` and
   `urlencodedParser` with Express defaults (100kb). The later `app.use(bodyParser.json({ limit:
   "10mb" }))` was appended _after_ those, so anything over 100kb already returned 413. Note that
   `isMiddlewareApplied` (`express-adapter.js:400`) inspects the router stack at `init()` time,
   which is before any user `app.use()` call, so Nest always won the race.

`bodyParser: false` is now set on `NestFactory.create` (`src/main.ts:35`) so the parsers registered
via `useBodyParser` are the only ones, making the 10mb limit real. This **raises the effective
request body limit from 100kb to 10mb**, which is a deliberate loosening of what the app actually
enforced. Revisit if that is not intended — revert to the default limit by dropping the `limit`
option.

`compression` has no built-in equivalent (grepped `@nestjs/core` and `@nestjs/platform-express`), so
it stays.

## Bugs found while auditing

### `CrudController` is unused

`src/lib/crud/crud.controller.ts:73` exports `CrudController`, but no controller extends it — no
feature controller imports it at all. Dead code, unrelated to Nest 12.

### Declared but never imported

Scanning every dependency in `package.json` against `src/`:

| Package                | Finding                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `url-minify`           | No import anywhere.                                                                                                             |
| `@nestjs/mapped-types` | No import anywhere, and pinned to `"*"` — also an unpinned-version smell.                                                       |
| `passport-magic-login` | No import anywhere. `MAGIC_LINK_EXPIRY` is configured in `jwt.config.ts` but no strategy exists.                                |
| `cache-manager`        | Used only for `import type { Cache }` at `src/lib/cache/cache.service.ts:3`. `@nestjs/cache-manager` re-exports that interface. |

Genuine false positives, keep them: `keyv` (required peer of `@keyv/redis`), `@mikro-orm/decorators`
(imported via its `/legacy` subpath), `passport` and `pino-http` (peers of `@nestjs/passport` and
`nestjs-pino`), `reflect-metadata`, `tslib`, and all `@types/*` plus tooling.

## v12 features worth adopting

### Standard Schema validation and serialization

Route parameter decorators accept a `schema` option, validated by `StandardSchemaValidationPipe`
(`@nestjs/common/pipes/standard-schema-validation.pipe.js`):

```ts
@Post()
create(@Body({ schema: createUserSchema }) body: CreateUserDto) {}

@Get(":id")
findOne(@Param("id", { schema: z.coerce.number().int().positive() }) id: number) {}
```

`StandardSchemaSerializerInterceptor` with `@SerializeOptions({ schema })` does the same for
outgoing responses.

Two things make this more attractive here than a like-for-like swap:

- The same schemas **feed OpenAPI generation**, which pairs well with the `@nestjs/swagger` plugin
  configured in `nest-cli.json`.
- There is currently **no** `ClassSerializerInterceptor` in `src/`, so serialization is net-new
  capability rather than a replacement.

The cost is real: 46 files import `class-validator`, plus the custom decorators in
`src/common/decorators/validation/`, the `BaseService` generics and the MikroORM integration. There is
also **no `createZodDto` in `@nestjs/common` 12** — the pipe validates a schema attached to parameter
metadata, so there is no drop-in DTO base class. Treat this as an incremental follow-up, not cleanup.

Upstream is explicit that the decorator-based class-validator workflow "remains fully supported, with
no plan to remove it."

### `@nestjs/observe`

The official observability SDK hooks into Nest's own request lifecycle via the `instrument`
application option rather than patching the HTTP server like a generic APM agent. Auto-instrumentation
covers HTTP, GraphQL, gRPC, microservice transports, queue consumers and cron runs.

Worth weighing because the sentry integration currently costs four packages
(`@ntegral/nestjs-sentry`, `@sentry/node`, `@sentry/hub`, `@sentry/types`) **plus** a custom
`InternalDisabledLogger` (`src/lib/pino/internal.logger.ts`) that suppresses Nest's own output.
Opt-in, and there is nothing to migrate.

### Machine-readable error codes

`HttpExceptionOptions` accepts an `errorCode` that is serialised into the response body, so clients
branch on a stable identifier instead of parsing message strings:

```ts
throw new BadRequestException("Password is too weak", { errorCode: "WEAK_PASSWORD" });
```

### Route conflict diagnostics

Two opt-in options surface route shadowing, where on order-sensitive adapters a `@Get(":id")`
declared before `@Get("me")` silently swallows the more specific route:

```ts
const app = await NestFactory.create(AppModule, {
  routeConflictPolicy: { duplicate: "error", shadow: "warn" },
  routeResolutionStrategy: "specificity",
});
```

Both default to previous behaviour, so nothing changes unless set.

**Enabled** in `src/main.ts` with `duplicate: "error"`, `shadow: "warn"` and
`routeResolutionStrategy: "specificity"`. A static analysis of the routes found no conflicts today:
the only parameterised routes are `:idx` in `crud.controller.ts:81` and `user.controller.ts:62`, and
every static route lives in a separate controller, so nothing is shadowed. `specificity` is the
safety net that matters here — it makes literal segments register before parametric ones on Express,
so a future controller extending `CrudController` and adding e.g. `@Get("me")` after `@Get(":idx")`
would resolve correctly instead of being silently swallowed, with a warning logged either way.

## Deprecations

### Webpack CLI workflows → rspack

`"start:hmr": "nest start --watch --webpack --webpackPath webpack-hmr.js"` in `package.json` uses
flags the v12 CLI deprecates in favour of `--builder rspack`. `nest-cli.json` has no
`webpack`/`webpackConfigPath` block, so only the script is affected.

Not a drop-in: `webpack-hmr.js`, `run-script-webpack-plugin`, `webpack` and `ts-loader` would all
need porting.

## Assessed, not applicable

| Item                                                    | Why it does not apply here                                                                          |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Packages ship as ESM                                    | Repo is CommonJS; `require(esm)` keeps it working. Node 24.21.0 clears the v20.19+/v22.12+ floor.   |
| NATS v3 (`nats` → `@nats-io/transport-node`)            | No NATS dependency.                                                                                 |
| GraphQL subscriptions / GraphiQL rename                 | No `@nestjs/graphql` dependency.                                                                    |
| `angular` schematic removed                             | No schematic usage.                                                                                 |
| `ConsoleLogger` structured params on by default         | All 31 `logger.*` call sites pass a template string; none pass a plain object as a second argument. |
| Built-in cookies (12.1.0)                               | Zero cookie usage.                                                                                  |
| Array of global prefixes (12.1.0)                       | Single prefix, read from config.                                                                    |
| File upload interceptors backed by `@fastify/multipart` | Express adapter, not Fastify.                                                                       |
| Lifecycle hooks invoked by hierarchy level              | Reviewed, no change needed — see below.                                                             |

## Security

`multer` resolves to **2.4.0** through `@nestjs/platform-express` 12.1.2, which carries the fix for
**CVE-2026-88932** (GHSA-3pph-fpjx-jg34). `FileInterceptor` usage is covered.

One behaviour change to be aware of: from 12.0.4 multer errors are mapped by code instead of message,
so a file sent under an unexpected field name returns **400 instead of 500**. Check for assertions on
that status.

## Lifecycle-hook ordering (reviewed)

All five hooks in `@nestjs/core/hooks/` now group instances by `hierarchyLevel`, sort the levels, and
await each level in turn:

| Hook                        | Level order | Within a level       |
| --------------------------- | ----------- | -------------------- |
| `onModuleInit`              | ascending   | `Promise.all`        |
| `onApplicationBootstrap`    | ascending   | `Promise.all`        |
| `onModuleDestroy`           | descending  | `Promise.allSettled` |
| `beforeApplicationShutdown` | descending  | `Promise.allSettled` |
| `onApplicationShutdown`     | descending  | `Promise.allSettled` |

Two details matter more than they look:

- **`hierarchyLevel` is DI depth, not module nesting.** `injector.js:72` sets
  `wrapper.hierarchyLevel = depth + 1`, where `depth` is the highest `hierarchyLevel` among the
  instance's constructor-injected params (`injector.js:159`). A provider injecting nothing is level 1;
  one injecting a level-1 provider is level 2. **Sibling modules never reorder each other** — only
  constructor injection chains do.
- **The `@Module()` class's own hook runs last**, and only when `moduleClassHost.isDependencyTreeStatic()`
  is true (`on-module-init.hook.js:44`).

### This repository

There is exactly **one** lifecycle hook in `src/` (verified by grepping all five interface names and
their method forms):

```ts
// src/lib/mailer/mailer.module.ts:16
async onModuleInit() {
  await this.mailService.checkConnection();
}
```

Consequences:

- **No ordering assumption to fix.** `MailModule.onModuleInit` awaits a provider it injects, so that
  provider is already constructed, and no other hook in the module exists to race with. Level
  grouping is a no-op here.
- **One assumption became _more_ deterministic.** The module-class hook now runs after every grouped
  instance rather than interleaved with them, so `checkConnection()` no longer races other providers'
  `onModuleInit`.
- **One latent trap.** Because the module-class hook is guarded by `isDependencyTreeStatic()`,
  converting `MailerService` to transient or request scope would make `checkConnection()` stop running
  silently. Worth a comment on the provider if it is ever rescoped.
- **`isDependencyTreeStatic()` also filters the grouped instances** (`get-instances-grouped-by-hierarchy-level.js`),
  so request-scoped providers are excluded from hooks entirely — they are now handled through a
  separate path. Nothing in `src/` is request-scoped today.

### The shutdown path is where this repo is most lifecycle-sensitive

Not because of hooks — because it uses **none**. `AppUtils.gracefulShutdown`
(`src/common/helpers/app.utils.ts:35`) arms `setTimeout(() => process.exit(1), 5000)` and then awaits
`app.close()`, which drives `onModuleDestroy` → `beforeApplicationShutdown` → `onApplicationShutdown`.

- The DESC level order is the right direction: anything that depends on the mail service is torn down
  before it. Add shutdown hooks on consumers, not on the thing they consume.
- Nest 12 switching the shutdown hooks to `Promise.allSettled` per level (up from fail-fast) is a real
  reliability gain here — one throwing teardown hook no longer aborts its level. Rejections are logged
  via `Logger.error` rather than propagated.
- **Pre-existing, and more relevant now:** `killAppWithGrace` (`app.utils.ts:50`) registers SIGINT and
  SIGTERM handlers with no re-entrancy guard, so a second signal starts a second `app.close()`. With
  three ordered shutdown phases interleaving across both calls, that is now worth guarding. The hard
  5s `process.exit(1)` also means a slow teardown is SIGKILLed mid-flight regardless of hook ordering.

## Follow-ups

- Re-run `pnpm test:e2e` against a live database; it has not been run at all during this work.
- Register `minio`, `sentry`, `stripe` and `twilio` in `configValidationSchema`
  (`src/lib/config/config.validation.ts`). Those four schemas are exported but never composed in, so
  they are dead validation.
- Guard `AppUtils.killAppWithGrace` against a second signal re-entering `app.close()`, and reconsider
  the hard 5s `process.exit(1)` that truncates slow teardowns.
- Decide on `CrudController`: wire it up or delete it.
