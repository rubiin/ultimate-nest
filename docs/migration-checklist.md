# NestJS 11 → 12 Migration Checklist

Tracked against the official [migration guide](https://docs.nestjs.com/migration-guide). Every row was
checked against this repository, not assumed from the release notes.

Legend: **Done** · **Verified N/A** (checked, does not apply) · **Open** (not adopted) ·
**Broken** (started, not working)

Progress: **9 Done · 10 Verified N/A · 3 Open · 0 Broken**

| #   | Guide item                                                                                                                                    | Status       |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| 1   | Upgrade `@nestjs/cli` / `@nestjs/schematics`, run `nest upgrade`                                                                              | Verified N/A |
| 2   | Node.js `v20.19+` / `v22.12+` to run, `v24.15+` for the CLI                                                                                   | Done         |
| 3   | ESM packages — CommonJS still works via `require(esm)`                                                                                        | Verified N/A |
| 4   | New project defaults (CommonJS/ESM prompt)                                                                                                    | Verified N/A |
| 5   | Testing stack — Vitest                                                                                                                        | Done         |
| 6   | Linting defaults — oxlint                                                                                                                     | Done         |
| 7   | `@Optional()` is no longer inherited                                                                                                          | Verified N/A |
| 8   | Lifecycle hook ordering                                                                                                                       | Done         |
| 9   | Config module on Standard Schema (Joi → Zod)                                                                                                  | Done         |
| 10  | Terminus: legacy `HealthIndicator` / `HealthCheckError` removed                                                                               | Verified N/A |
| 11  | Webpack CLI deprecation → `--builder rspack`                                                                                                  | Done         |
| 12  | Route conflict diagnostics                                                                                                                    | Done         |
| 13  | `ConsoleLogger` structured params                                                                                                             | Verified N/A |
| 14  | `class-validator` / `class-transformer` stay supported                                                                                        | Done         |
| 15  | GraphQL: GraphiQL default                                                                                                                     | Verified N/A |
| 16  | GraphQL: `subscriptions-transport-ws` removed                                                                                                 | Verified N/A |
| 17  | NATS v3 → `@nats-io/transport-node`                                                                                                           | Verified N/A |
| 18  | Route decorator `schema` option                                                                                                               | Open         |
| 19  | `StandardSchemaSerializerInterceptor`                                                                                                         | Verified N/A |
| 20  | `HttpExceptionOptions.errorCode`                                                                                                              | Done         |
| 21  | `@nestjs/observe`                                                                                                                             | Open         |
| 22  | New CLI commands/flags (`deploy`, `--rspackPath`, `--emit-declarations`, `--no-type-check`, `--silent`, `--parallel`, `includeLibraryAssets`) | Open         |

## Done

**2. Node.js.** Pinned to `24.21.0` in `.nvmrc`, with `engines.node: ">=24.21.0"`. Clears both the
runtime floor (v20.19+/v22.12+) and the higher `@nestjs/schematics` floor (v24.15+) that `nest
generate` / `nest upgrade` need. Not on the unsupported 21.x line.

**5. Testing stack.** Already on Vitest 5 across `test`, `test:watch`, `test:cov` and `test:e2e`.
Relevant because the guide warns Jest can only load the ESM-only v12 packages on Node v24.9+
(`ERR_REQUIRE_ASYNC_MODULE` otherwise). Not applicable here.

**6. Linting.** Already on oxlint via `pnpm lint`, matching the new default.

**8. Lifecycle hook ordering.** Reviewed. All five hooks now group by `hierarchyLevel`, sort levels
ascending for init/bootstrap and descending for the shutdown hooks, and run instances within a level
concurrently (`Promise.allSettled` for shutdown). `hierarchyLevel` is DI depth, not module nesting —
sibling modules never reorder each other. The repo has exactly one hook,
`MailModule.onModuleInit` (`src/lib/mailer/mailer.module.ts:16`), which awaits a provider it injects,
so there is no ordering assumption to fix. Details and the shutdown-path findings are in
[migration.md](./migration.md#lifecycle-hook-ordering-reviewed).

**9. Config module.** Migrated from Joi to Zod via Standard Schema. `validationSchema` now takes
`configValidationSchema` from `src/lib/config/config.validation.ts`, and the Joi-specific
`validationOptions.libraryOptions` block is gone. Covered by 33 tests in
`src/lib/config/config.validation.spec.ts`.

**12. Route conflict diagnostics.** Enabled in `src/main.ts` with
`routeConflictPolicy: { duplicate: "warn", shadow: "warn" }` and
`routeResolutionStrategy: "specificity"`.

Enabling it immediately found a real pre-existing bug. With `duplicate: "error"` the application
**refused to boot**:

```
RouteConflictException: Conflicting HTTP routes detected:
  - Duplicate route: POST /v1/users is registered by both UserController#referUser and UserController#create.
```

`src/modules/user/user.controller.ts` declares `@Post()` twice with no path segment — `referUser` at
line 27 and `create` at line 73. Both resolve to `POST /v1/users`. Declaration order means `referUser`
wins, so `create` has been silently unreachable: the authenticated user-create endpoint does not
work.

`duplicate` was relaxed to `"warn"` so the app boots while the conflict stays visible in the logs.
**Fixing it properly is a public API decision, not a mechanical one** — the likely fix is moving
`referUser` to `POST /users/refer`, but that changes the API for existing clients, so it is left for
you to call. Do not leave it on `"warn"` indefinitely.

**14. class-validator / class-transformer.** Intentionally retained. The guide states the
decorator-based workflow is fully supported with no plans to remove it, and rows 18–19 are the
additive alternative.

## Verified N/A

Each of these was checked against the source, not skipped.

**1. `nest upgrade`.** The repo is already on `@nestjs/*` 12.x (`@nestjs/common` 12.1.2,
`@nestjs/core` 12.1.2, `@nestjs/platform-express` 12.1.2, `@nestjs/config` 12.0.1,
`@nestjs/cli` 12.0.8). The upgrade command's mechanical steps — the Joi bump, the
`@nestjs/config` validation-options move, the NATS swap, GraphQL renames — were done by hand instead.
No `webpack`/`webpackConfigPath` block existed in `nest-cli.json` for it to rewrite.

**3. ESM packages.** The project is CommonJS and stays that way, which the guide explicitly allows.
`require(esm)` covers consumption of the ESM-only packages.

**4. New project defaults.** Scaffolding behaviour only; affects `nest new`, not existing projects.

**7. `@Optional()` no longer inherited.** The breaking change is real: Nest now reads optional markers
with `Reflect.getOwnMetadata`, so a subclass without its own constructor loses its parent's
`@Optional()` and can throw `UnknownDependenciesException`. It does not affect this repo —
`src/` contains **zero** uses of `@Optional()` from `@nestjs/common`. Every `IsOptional` hit is
class-validator's property decorator (DTO validation) and `Optional<T>` is a local type alias in
`src/common/@types/types/common.types.ts:4`. Worth keeping in mind if a base class with optional
constructor params is ever introduced, since `BaseService` and `BaseRepository` are subclassed
widely.

**10. Terminus.** `HealthController` (`src/modules/health/health.controller.ts`) uses only the
built-in `HttpHealthIndicator`, `DiskHealthIndicator`, `MemoryHealthIndicator` and
`MikroOrmHealthIndicator`. No custom indicator extends the removed `HealthIndicator` base class, and
nothing throws `HealthCheckError`. The deprecated `timeout` **option** on the built-in indicators is
also not used, so the `.withTimeout()` migration does not apply.

**13. Structured logging params.** On by default in v12 and would change output shape. Checked all 31
`logger.*` call sites in `src/`: every one passes a template string, none pass a plain object as a
second argument, so nothing changes and `structuredParams: false` is not needed.

**15 / 16. GraphQL.** No `@nestjs/graphql` dependency, so neither the GraphiQL rename nor the
`subscriptions-transport-ws` → `graphql-ws` swap applies.

**17. NATS v3.** No NATS dependency. (RabbitMQ is used, via `@golevelup/nestjs-rabbitmq`, which is
unaffected.)

## Verified by booting the app

**11. Webpack -> rspack.** Migrated and verified by booting the app.

```json
"start:hmr": "nest build --watch --builder rspack --rspackPath rspack-hmr.js"
```

`webpack-hmr.js` is deleted and `webpack` + `ts-loader` are dropped. Verified by running it: rspack
compiles in ~230ms, the bundle boots the full Nest application, passes config validation, connects
RabbitMQ, discovers 21 MikroORM entities, registers all routes, and shuts down gracefully on
SIGTERM. Only external services are missing in that environment (Postgres/Redis/RabbitMQ/SMTP all
ECONNREFUSED), so it never reaches `listen()`.

Two things the port needed, neither of which was predictable from the docs:

- **`node: { __dirname: true, __filename: true }` is load-bearing.** `src/lib/i18n/i18n.module.ts`
  and `src/lib/serve-static.module.ts` locate `resources/` via `__dirname`, and bundling flattens
  the directory tree. With the CLI's rspack defaults (`node: { __dirname: false }`) the i18n loader
  resolved to a path _outside_ the repository and boot failed with
  `i18n path (.../typescript/resources/i18n/) cannot be found`. The old webpack config carried the
  same option for the same reason. This is fragile: any new `__dirname`-relative resource lookup
  needs the same treatment, and `HelperService.getAppRootDir()` would be a sturdier base.
- **An earlier `NODE_ENV` diagnosis was wrong.** The first failure
  (`Cannot read properties of undefined (reading 'startsWith')` in `HelperService.isProd()`) looked
  like rspack failing to define `process.env.NODE_ENV`, but the bundle emits a live
  `node_process__rspack_import_2_default().env.NODE_ENV` lookup. The real cause was that `NODE_ENV`
  was simply unset in the shell: `process.env.NODE_ENV.startsWith(...)` throws in plain Node too,
  and every `just` recipe sets `NODE_ENV` explicitly. No `DefinePlugin` was needed.

Migration notes worth keeping:

- `RunScriptWebpackPlugin` ports unchanged - it only taps `compiler.hooks.afterEmit` and reads
  `compilation.assets`, and rspack exposes both. It is **not** renamed, so it stays a dependency.
- `webpack-node-externals` must **stay**; the CLI's own rspack defaults depend on it.
- rspack has **no** `WatchIgnorePlugin` and no `webpack/hot/poll` HMR client, so true hot-swapping is
  not available. `rspack-hmr.js` uses `autoRestart: true` instead, so rebuilds restart the server
  rather than hot-swapping it. The script name is now a slight misnomer.
- Dropping `WatchIgnorePlugin` means `.js`/`.d.ts` files are no longer excluded from the watch graph,
  so rebuilds may fire more often than under webpack. Not measured.
- Running the app regenerates the tracked MikroORM metadata caches in `temp/`. Revert those before
  committing.

## Open

Rows 18–21 are additive v12 features, not migration blockers. None is adopted.

**18. Route decorator schemas.** `@Body({ schema })` / `@Param("id", { schema })` plus
`StandardSchemaValidationPipe`. The cost here is high: 46 files import `class-validator`, plus the
custom validators in `src/common/decorators/validation/`, `BaseService` generics and the MikroORM
coupling. There is also no `createZodDto` in `@nestjs/common` v12, so there is no drop-in DTO base
class. The upside is that the same schemas feed OpenAPI generation.

**19. `StandardSchemaSerializerInterceptor`.** Verified N/A: evaluated, not adopted. The interceptor only runs the
response through a schema's `~standard.validate()` (set via `@SerializeOptions({ schema })`), so it
validates or strips a whole response per route. It cannot express a per-entity computed field, and it
never sees a `User` nested inside a `Post` or profile response. The one piece of presentation logic
in `src/`, the default-avatar fallback in `User.toJSON()`, moved into the entity's serialization
metadata instead: the stored `avatar` column is `hidden` and a `persist: false` `avatarUrl` getter is
serialized as `avatar` (`serializedName`), so direct and nested users serialize as before. Pinned by
`user.entity.spec.ts`.

**20. `errorCode`.** Added. `ERROR_CODES` in
`src/common/constant/error-code.constants.ts` holds the stable identifiers (also exported as an
`ErrorCode` union type), and all eight HTTP throw sites now pass one:

| Site                                         | Code                        |
| -------------------------------------------- | --------------------------- |
| `auth.guard.ts` — no `authorization` header  | `AUTH_TOKEN_MISSING`        |
| `auth.guard.ts` / `jwt.guard.ts` — expired   | `TOKEN_EXPIRED`             |
| `auth.guard.ts` / `jwt.guard.ts` — malformed | `TOKEN_MALFORMED`           |
| `jwt.guard.ts` — other token failure         | `TOKEN_INVALID`             |
| `base.repository.ts` — bad date cursor       | `CURSOR_INVALID_DATE`       |
| `base.repository.ts` — bad number cursor     | `CURSOR_INVALID_NUMBER`     |
| `auth.service.ts` — `findUser` found nothing | `USER_NOT_FOUND`            |
| `maintenance.middleware.ts` — 503            | `SERVICE_UNDER_MAINTENANCE` |

Two behaviours worth knowing, both pinned by `maintenance.middleware.spec.ts`:

- `errorCode` passed as the **options** argument is serialized for string-form responses, but
  **silently dropped** for object-form ones — `HttpException.createBody` returns an object response
  verbatim. `SettingMaintenanceMiddleware` therefore carries `errorCode` inside the body object.
- The base `HttpException` skips `createBody` entirely, so only subclasses serialize the code. Plain
  `new HttpException("msg", { errorCode })` keeps `errorCode` on the instance but never emits it.

Not covered, deliberately: the four `WsException` sites (socket transport, no `HttpExceptionOptions`)
and the three bare `throw new Error(...)` sites (not HTTP exceptions). `HttpExceptionFilter` and
`QueryFailedFilter` in `src/common/filters/` also drop `errorCode`, but neither is registered anywhere
in `src/` — the global handler is nestjs-i18n's `I18nValidationExceptionFilter`, which only handles
validation errors and passes everything else to Nest's default filter.

**21. `@nestjs/observe`.** Official observability SDK via the `instrument` app option. Worth weighing
against the current sentry setup (`@ntegral/nestjs-sentry`, `@sentry/node`, `@sentry/hub`,
`@sentry/types`, plus a custom `InternalDisabledLogger` that suppresses Nest's own output). Opt-in.

**22. New CLI commands and flags.** `deploy`, `--emit-declarations`, `--no-type-check`, `--silent`,
`--parallel`, `includeLibraryAssets`. None adopted. `bun` is not used as a package manager here.

## Also outstanding

Carried over from the audit, unrelated to the guide:

- Re-run `pnpm test:e2e` against a live database. It has never been run, so `useSecurityHeaders()`,
  the 10mb body limit and the route conflict policy are only compile- and unit-checked.
- ~~Register `minio`, `sentry`, `stripe` and `twilio` in `configValidationSchema`~~ — done; all
  four are registered in `load` and composed in with optional fields, so unset integrations boot
  while empty values are rejected.
- Decide on `CrudController` (`src/lib/crud/crud.controller.ts:73`) — exported, never extended.
- Guard `AppUtils.killAppWithGrace` (`src/common/helpers/app.utils.ts:50`) against a second signal
  re-entering `app.close()`, and reconsider the hard 5s `process.exit(1)` that truncates teardowns.
- Revisit `supercharge/request-ip` — no Nest 12 built-in exists, but `app.enable("trust proxy")` is
  already set, so `request.ip` is viable.

## `LazyModuleLoader` for optional integrations — not applicable

Audit candidates: minio, stripe, twilio, sentry. None is eligible, so no code was changed.

- **minio** (`src/lib/minio.module.ts`), **stripe** (`src/lib/stripe.module.ts`), **sentry**
  (`src/lib/sentry.module.ts`) are exported from `src/lib/index.ts` but imported by no module:
  `SharedModule` (`src/modules/shared/shared.module.ts:20-36`) does not list them, and no service
  injects `NestMinioService`, `Stripe` or `Sentry`. They are not in the eager graph, so there is
  nothing to defer.
- **twilio** (`src/lib/twilio/twilio.module.ts`) is not imported anywhere, and `TwilioService` has no
  consumer outside `src/lib/twilio`. It also needs `forRoot`/`forRootAsync` options, so it is not a
  plain lazy-loadable module.
- **stripe** is additionally route-bearing: `@golevelup/nestjs-stripe` registers the webhook
  controller, and `src/modules/app.module.ts:9,19` wires raw-body handling for `stripe/webhook`.
  `NestStripeModule` is `@Global()` and adds a `SkipThrottle` decorator, so it must stay eager if
  ever enabled.
- **sentry** is `@Global()` and must stay eager to capture boot and early errors.
- **minio** is registered with `isGlobal: true`, so lazy loading would not make it visible to
  already-built consumers.

Revisit when a service actually consumes one of these: a non-route, non-global module with a single
consumer (twilio is the best fit) can then be loaded via `LazyModuleLoader.load(() => import(...))`.
