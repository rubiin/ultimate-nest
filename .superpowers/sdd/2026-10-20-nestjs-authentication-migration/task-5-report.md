# Task 5 report — scrypt/argon2 password shim

Status: **DONE** — committed as `771a9d46` on `feat/nestjs-authentication`.

## What changed

- `src/common/helpers/helpers.utils.ts`
  - Added an exported `passwordHasher` singleton (`new PasswordHasher()` from
    `@nestjs/authentication`, package default params: scrypt N=2^17, r=8, p=1).
  - `HelperService.hashString` now delegates to `passwordHasher.hash` (scrypt).
  - `HelperService.verifyHash` dispatches on the stored hash: `$scrypt$` →
    `passwordHasher.verify`; anything else (legacy `$argon2*` rows) keeps verifying
    through argon2 with the pre-existing options. Signature and Observable
    contract unchanged, so existing `verifyHash` mocks keep working.
- `src/modules/auth/auth.service.ts`
  - `validateUser` (password branch) now runs `upgradeStoredPassword` after a
    successful verify: a legacy argon2 hash is re-hashed with scrypt and a scrypt
    hash failing `passwordHasher.needsRehash` is re-hashed too. Persistence uses
    `nativeUpdate` with the pre-hashed value — the entity's `hashPassword` hook
    would re-hash an assigned password, and `nativeUpdate` bypasses hooks.
  - New private `upgradeStoredPassword(user, plainPassword)` helper.
- `src/entities/user.entity.ts` — no change needed: the `hashPassword` hook already
  calls `HelperService.hashString`, which is now scrypt. Pinned by a new test.
- `src/modules/auth/auth.service.ts` `changePassword` — no code change needed:
  it assigns the plaintext via `userRepository.assign` + `em.flush()`, and the
  hook hashes it with scrypt on update. Hashing explicitly there would double-hash
  through the hook (assign path), so the hook is the single hashing path for
  change/reset/create alike. New passwords land as `$scrypt$`.
- `src/lib/authentication.module.ts` — pre-existing format violation on the branch
  (line wrap in `SESSION_TRUSTED_ORIGINS` split); fixed so `pnpm format:check`
  passes. Formatting only.

## Tests

- `helpers.utils.spec.ts`: `hashString` now asserts `$scrypt$`; added legacy
  argon2 verify (match + mismatch) through `verifyHash`.
- `user.entity.spec.ts`: hook hashes with scrypt when the changeset carries a
  password; leaves it untouched otherwise.
- `auth.service.spec.ts` (`validateUser with a password`): legacy argon2 row is
  upgraded to `$scrypt$` via `nativeUpdate` after a successful login; a stale-scrypt
  (`ln=10`) row is re-hashed; a current (`ln=17`, 32-byte key, 16-byte salt) row is
  left alone (fixture self-checked with `needsRehash === false`).

## Verification

- Focused: 3 spec files, 61/61 pass.
- Gates (all run in the worktree): `pnpm build` pass; `pnpm test` 96 files /
  750 passed / 0 failed; `pnpm format:check` clean; `pnpm lint` — only 3 warnings,
  all in `src/lib/casl/generic.policy.spec.ts`, pre-existing from the sibling
  M-series casl commits, not from this diff.
- e2e (`pnpm test:e2e`) **not run** — needs a live database; not available here.
  The change touches auth behaviour, so run it before release.

## Concerns

1. **Shared-worktree race.** A sibling agent worked in the same checkout
   concurrently: it deleted `feat/nestjs-authentication`, stashed/discarded my
   uncommitted edits twice, and switched branches underneath this task. I
   recovered the work from a dropped stash object (`f825bdd0`), recreated the
   branch at its original tip `fe1fcd7d`, and finished in an isolated worktree
   at `/tmp/opencode/task5` (branch is checked out there — remove the worktree
   once this branch is integrated, or siblings cannot check it out).
2. The sibling also landed M5/M6 (`a7f529e4`, `18d35895`) on this branch; they are
   included in the base of my commit and untouched by it.
3. `changePassword`/`resetPassword`/registration produce scrypt transitively via
   the entity hook. If a future task removes that hook, those flows must hash
   explicitly (via `nativeUpdate`, not `assign`).
4. Unit specs pay real scrypt cost (logN 17, ~128 MiB) in a handful of
   `hashString`/hook tests — adds roughly a second to the suite; kept honest
   rather than parameterising the production singleton down.
