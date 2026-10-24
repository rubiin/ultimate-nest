Task 5: complete (commit 771a9d46, gates green — 96 files/750 tests; worktree /tmp/opencode/task5 holds the branch)
Task 5: minor (deferred): changePassword/resetPassword/create produce scrypt via entity hook (explicit hashing would double-hash); pinned by tests
Task 6: complete (commit 3e7fb093, gates green — 99 files/767 tests; worktree /home/devina/personal/typescript/ultimate-nest-auth-guard-flip holds the branch; e2e not run — no DB)
Task 6: scope addition: BearerAuth provider — the global guard had cookie-only auth, so bearer clients would 401 after the flip; keep exactly one bearer provider if a later task adds its own
Task 6: minor (deferred): WS chat clients must send `Bearer <t>` or `handshake.auth.token` to pass the global guard; raw `authorization` header only works with a session cookie
