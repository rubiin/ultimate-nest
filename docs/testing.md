# Testing

This project uses [Vitest](https://vitest.dev), not Jest. There are two separate suites with
their own configs: unit tests and end-to-end tests.

## Suites

| Suite      | Config                 | Location                | Command         |
| ---------- | ---------------------- | ----------------------- | --------------- |
| Unit       | `vitest.config.ts`     | `src/**/*.spec.ts`      | `pnpm test`     |
| End-to-end | `vitest.config.e2e.ts` | `test/**/*.e2e-spec.ts` | `pnpm test:e2e` |

With coverage: `pnpm test:cov` (reports to `coverage/`).

Run a single file or test name:

```
pnpm test src/modules/user/user.service.spec.ts
pnpm test -- -t "userService"
```

Both configs set `globals: true`, so `describe` / `it` / `expect` / `vi` need no imports.
`testTimeout` is 30s to accommodate DB-backed suites.

### Why two configs

The unit config pins `helper-fns` and `unprofane` to their **CommonJS** entry points. Both
publish ESM builds that reference `module`, `__dirname`, and `require` inside their `.mjs`
bundles, so they throw when Vitest loads them as real ES modules. The project compiles to
CommonJS, so pinning the `require` condition is the correct resolution. Leave that `resolve.alias`
block alone unless you are deliberately changing module format.

## Unit tests

Unit specs sit beside the code they cover and test services through Nest's testing module,
with dependencies replaced by mocks.

```ts
import { Test } from "@nestjs/testing";
import { UserService } from "./user.service";

describe("userService", () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        // ...mocked dependencies
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });
});
```

`Test.createTestingModule` is unchanged from Nest's docs — Vitest only replaces the runner.

### Mocks

Shared mocks live in `src/_mocks_/index.ts` and are imported through the `@mocks` alias.
They are built with `createMock` from `@golevelup/ts-vitest`, which produces deep auto-mocks
so a spec only overrides what it actually asserts on.

```ts
import { mockEm, mockUserRepo, mockedUser } from "@mocks";

mockEm.persist.mockReturnValue(mockEm);
```

Reset state in `beforeEach`:

```ts
vi.clearAllMocks();
```

Return values that need a resolved promise are cast, since `createMock` types returns
synchronously:

```ts
mockUserRepo.qbCursorPagination.mockReturnValue(of({ data: [], meta: { total: 0 } }) as never);
```

MicroORM's entity manager is chained (`persist().flush()`), so `mockEm.persist` has to return
`mockEm` itself.

## End-to-end tests

E2E specs use [Supertest](https://github.com/visionmedia/supertest) to drive a **running
server** over HTTP. They do not bootstrap the app in-process.

`APP_URL` in `test/fixtures/constant.ts` is the base URL these tests hit:

```ts
export const APP_URL = "http://localhost:8000/v1";
```

Point it at your local instance, start the server in one terminal, and run the suite in
another. Reusable payloads and helpers live in `test/fixtures/` (`user.ts`, `post.ts`).

```ts
import request from "supertest";
import { APP_URL } from "../fixtures";

const app = APP_URL;

it("should get a list of all posts (GET)", () =>
  request(app)
    .get("/posts")
    .auth(adminJwtToken, { type: "bearer" })
    .expect(({ body }) => {
      expect(body.meta).toBeDefined();
      expect(body.items).toBeDefined();
    })
    .expect(200));
```

E2E needs a live database, seeded users, and generated env files. The `justfile` sets
`NODE_ENV` and the seed password for you:

```
just test-e2e          # pnpm test:e2e with NODE_ENV and credentials set
pnpm sample            # generate env/.env.dev if it is missing
just seed              # load seed data
```

Running `pnpm test:e2e` directly skips that setup and will usually fail to connect.

See the [test folder](https://github.com/rubiin/ultimate-nest/tree/master/test) for complete
examples.

## Lint and typing

`@typescript-eslint/no-explicit-any` is disabled for `*.spec.ts` in `.oxlintrc.json` — casts
such as `as never` in mock setups are expected. That exemption does not apply to production
code, and note that oxlint does not otherwise enforce `no-explicit-any`, so it will not warn
you in either case.

Specs are type-checked like any other file, so an unused import in a spec fails `pnpm build`.
