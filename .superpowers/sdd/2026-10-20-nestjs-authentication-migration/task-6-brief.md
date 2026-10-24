# Task 6 brief — guard flip + @Public() sweep

## Objective
Flip to the package's global AuthenticationGuard (already registered via NestAuthenticationModule in SharedModule, globalGuard defaults true) and sweep routes with @Public()/@Auth() so behavior is preserved: previously-open reads stay open, previously-protected writes stay protected.

## Deliverables
1. `src/common/decorators/auth.decorator.ts`: remove `JwtAuthGuard` from `@Auth()` (global guard now authenticates); keep `PoliciesGuard` + swagger decorators. `@Auth()` now just means "requires an authenticated user + CASL policy".
2. `src/common/guards/jwt.guard.ts`: leave file (still used by twofa tests?) — check usages; if unused, leave (deletion is a later pass).
3. Sweep controllers:
   - Routes previously guarded by @Auth() keep @Auth() (CASL) — already there.
   - Routes previously unguarded that must remain public (GET tags, categories, posts list/get/search/comments, health, app ping, etc.) get @Public().
   - Routes previously unguarded that must be protected (POST/PATCH/DELETE on posts, comments, favorites, profile follow/unfollow, chat) get @Auth().
4. WsJwtGuard (chat) keeps working — tokens carry claims.type="access" (ACCESS_TOKEN_CLAIMS), already verified.
5. Update twofa controller spec if it asserts JwtAuthGuard (it imports JwtAuthGuard) — keep consistent.

## Constraints
- pnpm only; no as any; noUnusedLocals.
- Don't change route paths or response shapes.
- Run full gates before commit; e2e if available.

## Commit message
`feat(auth): flip to the global AuthenticationGuard and sweep @Public()`
EOF
echo written