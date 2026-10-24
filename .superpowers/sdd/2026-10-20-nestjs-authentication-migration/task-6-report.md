# Task 6 report — guard flip + @Public() sweep

Status: **DONE** — committed as `3e7fb093` on `feat/nestjs-authentication`.

## Environment note (shared-checkout race)

The shared checkout `/home/devina/personal/typescript/ultimate-nest` was switched to
`master` by a sibling session mid-task (it also carries that session's uncommitted
`src/modules/token/*` edits), so this task ran in a new isolated worktree:
`/home/devina/personal/typescript/ultimate-nest-auth-guard-flip` (branch at `771a9d46`
base). The branch is checked out there — remove the worktree once the branch is
integrated, or siblings cannot check it out.

## What changed

### Deliverables

1. `src/common/decorators/auth.decorator.ts` — `@Auth()` no longer applies
   `JwtAuthGuard`; `guards: [PoliciesGuard]` plus the swagger decorators
   (`ApiBearerAuth`, 401 response). `@Auth()` now means "authenticated user (global
   guard) + CASL policy".
2. `src/common/guards/jwt.guard.ts` — left in place as the brief says (still covered
   by its own spec). Production code no longer imports `JwtAuthGuard`; `JwtStrategy`
   stays registered in `AuthModule` for the later deletion pass.
3. `src/common/decorators/public.decorator.ts` — the local `@Public()` now **also
   applies the package's `Public()`**, which writes the `AUTHENTICATION_METADATA`
   (`{ public: true }`) the global `AuthenticationGuard` reads. Without this the
   sweep would have been inert: the global guard never reads the legacy `isPublic`
   key. The legacy `isPublic` + swagger security-strip metadata stay for
   `PoliciesGuard` and `app.utils` (swagger `security: []`).
4. **Scope addition (required for "behavior preserved"):**
   `src/modules/auth/providers/bearer-auth.provider.ts` — a `JwtBearerProvider<User>`
   subclass (`BearerAuth`), registered in `AuthModule`. Rationale: the app registered
   only `SessionAuth` (a cookie provider) and the package ships **no default bearer
   provider** (README shows apps must write one). The global guard challenges every
   non-public route, so without this every `Authorization: Bearer <accessToken>`
   client — the e2e suite, the documented API flow — would get
   `401 missing_credentials` the moment `JwtAuthGuard` leaves `@Auth()`.
   `validate()` asserts `claims.type === "access"`, converts the string `sub`, and
   loads an active user (mirrors `JwtStrategy`/`SessionAuth`). Verification comes
   from the module's `accessToken` key/issuer/audience, which already rejects the
   legacy iss/aud partial 2fa token.
5. `src/modules/twofa/twofa.controller.spec.ts` — updated per deliverable 5:
   setup routes now expect exactly `[PoliciesGuard]` (no `JwtAuthGuard` import left),
   plus two new pins: `authenticate` is `@Public()`, the setup routes are not.
6. `docs/decorators.md` — stale `@Auth()` ("applies Jwt guard") corrected.

### Controller sweep

**Public (`@Public()` added):**

- `health` — `GET /health`, `GET /health/test` (the health check pings `/test` itself).
- `app` — `GET /ping`.
- `post` — list, `search`, `:slug`, `:slug/comments` (brief-mandated catalog reads).
- CRUD factory (`crud.controller.ts`, covers **tags, category, newsletter**) —
  `GET /:idx`, `GET /` list. Writes on the factory need no decorator: tags/newsletter
  writes carry class-level `@Auth()`; category writes are authenticated by the global
  guard by default (previously unguarded — now protected, as the brief requires).
- `auth` — `login`, `reset-password`, `verify-otp`, `oauth/login`,
  `token/refresh`, and the four google/facebook routes (passport guards would never
  run behind a global 401).
- `twofa` — `POST /2fa/authenticate`: the partial token is signed with the legacy
  iss/aud pair, so the global guard must stand aside for the `jwt2fa` strategy.

**Protected (no change needed):**

- Writes on posts/comments/favorites, profile follow/unfollow, chat, user
  writes, newsletter subscribe/delete: all sit on `GenericController(secured=true)`
  controllers, which already apply `Auth()` **at class level** — post-flip that is
  global-guard authentication + `PoliciesGuard`. Adding method-level `@Auth()` would
  run `PoliciesGuard` twice (Nest concatenates class and method guard metadata without
  dedup), so the end state is reached without redundant decorators.
- `GET /profile` and `GET /chat` use `@LoggedInUser` — they stay authenticated
  (class-level `@Auth()`), matching their previous Jwt-guarded behavior.
- `twofa` setup routes (`generate`, `turn-on`) keep explicit `@Auth()`; the global
  guard rejects the partial token there (legacy iss/aud), preserving "a password-only
  token must not set up 2FA".
- Pre-existing `@Public()`: users list, user register, newsletter unsubscribe-by-token.

**Intentional read-openings (flagged for review):** tags/post/newsletter GETs were
previously behind the class-level Jwt guard; the brief mandates tags/posts public
(catalog reads). Newsletter list/item GETs follow the same pattern under the brief's
"etc." — its content entity has no draft/private fields and its unsubscribe route was
already public.

## Tests

- New `src/lib/authentication.guard.http.spec.ts` (5): boots a minimal app with the
  real `AuthenticationModule.forRoot` + `BearerAuth` (stubbed repo) — `@Public()` skips
  the global guard; no credentials → 401; signed access token → 200; legacy iss/aud
  partial token → 401; wrong `type` claim under the real iss/aud → 401.
- New `bearer-auth.provider.spec.ts` (8): registry registration, access claims load
  the user, non-access/missing `type` rejected without querying, non-numeric `sub`,
  unknown/inactive user → null.
- New `auth.decorator.spec.ts` (1): `@Auth()` applies exactly `[PoliciesGuard]`.
- Updated `twofa.controller.spec.ts`: 3 new assertions (above).
- Untracked `src/modules/app.module.spec.ts` (main checkout): **left in place**. It
  asserts `AppModule` imports the feature modules directly, which this branch's
  `AppModule` does not (it imports `SharedModule`), so it does not belong to this
  branch's state.

## Verification

All gates run in the worktree:

- `pnpm build` — pass (tsc type gate).
- `pnpm test` — **99 files / 767 passed / 0 failed** (baseline at task 5: 96 / 750;
  +3 files, +17 tests).
- `pnpm lint` — no new warnings (same 3 pre-existing in
  `src/lib/casl/generic.policy.spec.ts`).
- `pnpm format:check` — clean, including `docs/decorators.md`.
- e2e (`pnpm test:e2e` / `just test-e2e`) **not run** — no live database in this
  environment (no containers, `env/` absent). The change touches HTTP auth behavior,
  so run the e2e suite (bearer flow against posts/user) before release.

## Concerns

1. **BearerAuth was added beyond the brief's deliverable list.** It is load-bearing:
   without it the flip breaks every bearer client (401 on all protected routes).
   If a later task was meant to register a bearer provider, keep exactly one.
2. **WS chat client contract.** `WsJwtGuard`/`handleConnection` read a **raw**
   `handshake.headers.authorization`; the package's bearer extraction accepts only
   `Bearer <token>` or socket.io `handshake.auth.token`. A token-only WS client (no
   session cookie) would be refused by the global guard before `WsJwtGuard` runs;
   browser clients (same-origin session cookie + raw header) work. Aligning the chat
   client with the package's extraction is a follow-up (brief deliverable 4 —
   "keeps working" — holds for cookie-carrying clients; no code changed there).
3. `JwtStrategy` + `passport-jwt` are now reachable only from `JwtAuthGuard`, which
   production code no longer applies — kept per the brief (deletion is a later pass).
4. `forgot-password` keeps its pre-existing `@Auth()` (pre-migration behavior,
   unchanged here; note it means password-reset OTP requests require a session).

## Report

This file: `/home/devina/personal/typescript/ultimate-nest/.superpowers/sdd/2026-10-20-nestjs-authentication-migration/task-6-report.md`
