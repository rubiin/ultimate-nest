Task 5: complete (commit 771a9d46, gates green — 96 files/750 tests; worktree /tmp/opencode/task5 holds the branch)
Task 5: minor (deferred): changePassword/resetPassword/create produce scrypt via entity hook (explicit hashing would double-hash); pinned by tests
Task 6: complete (commit 3e7fb093, gates green — 99 files/767 tests; worktree /home/devina/personal/typescript/ultimate-nest-auth-guard-flip holds the branch; e2e not run — no DB)
Task 6: scope addition: BearerAuth provider — the global guard had cookie-only auth, so bearer clients would 401 after the flip; keep exactly one bearer provider if a later task adds its own
Task 6: minor (deferred): WS chat clients must send `Bearer <t>` or `handshake.auth.token` to pass the global guard; raw `authorization` header only works with a session cookie
Task 6: complete (commit 3e7fb093, gates green — 99 files/767 tests; worktree /home/devina/personal/typescript/ultimate-nest-auth-guard-flip holds the branch)
Task 6: minor (deferred): added BearerAuth provider (package ships no bearer provider; required for Bearer clients); WS chat only works for cookie clients
Task 6: minor (deferred): untracked app.module.spec.ts left in main checkout (asserts AppModule shape this branch lacks)
Task 7: complete (docs — no references to TokensService/refresh_token module found; no doc changes required)
Task 8: complete (final verification — build ✓, test 99/767 ✓, lint 3 baseline warnings ✓, format:check ✓; e2e not run — no live DB; store contract e2e verified 12/12 in Task 4 under Docker)
