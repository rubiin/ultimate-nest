# Getting started

Run the API locally against throwaway Postgres, Redis, RabbitMQ and Mailpit containers.

## Prerequisites

- Node `24.21.0` or newer (pinned in `.nvmrc`)
- [pnpm](https://pnpm.io) (the lockfile is `pnpm-lock.yaml`, do not use npm or yarn)
- Docker, with Compose v2 (`docker compose`, not `docker-compose`)
- Optional: [just](https://github.com/casey/just) for the shortcuts in `justfile`

## 1. Install and configure

```sh
pnpm install
cp env/.env.dev.sample env/.env.dev
```

The sample is a complete local setup. Every value in it is a throwaway, so it boots as is. Env files are
read from `env/.env.<NODE_ENV>`, and `NODE_ENV` must be one of `dev`, `prod`, `test` or `stage`, so every
command below runs with `NODE_ENV=dev`.

Config is validated at startup (`src/lib/config/configs`). A missing or malformed variable stops the app
with the name of the offending key.

The Cloudinary, Google and Facebook values are placeholders. The app boots with them, but avatar uploads and
OAuth login fail until you put real credentials in.

## 2. Start everything

`docker-compose.dev.yml` runs the whole local stack: Postgres, Redis, RabbitMQ, Mailpit and the app itself. The
app container builds, waits for Postgres, migrates, seeds and then serves, so this one command covers what
used to be steps 2 to 4.

```sh
docker compose -f docker-compose.dev.yml up --build
```

`--build` is only needed the first time, or after changing dependencies. Add `-d` to detach.

The credentials match `env/.env.dev.sample`. Inside the compose network the app reaches the other services by
name (`database`, `redis`, `rabbitmq`, `mailpit`), which the `app` service overrides for `DB_HOST`,
`REDIS_HOST`, `RABBITMQ_URI` and `MAIL_HOST`. Every port is still published, so the URLs below are the same
either way.

| Service  | Port           | Notes                                                        |
| -------- | -------------- | ------------------------------------------------------------ |
| App      | `3000`         | The API, prefixed with `APP_PREFIX`                          |
| Postgres | `5432`         |                                                              |
| Redis    | `6379`         | The username is the built-in `default`                       |
| RabbitMQ | `5672`/`15672` | Management UI at http://localhost:15672                      |
| Mailpit  | `1025`/`8025`  | Captures all outgoing mail, read it at http://localhost:8025 |

| URL                         | What                                                                        |
| --------------------------- | --------------------------------------------------------------------------- |
| http://localhost:3000/doc   | Swagger UI                                                                  |
| http://localhost:3000/stats | Metrics dashboard, basic auth `SWAGGER_USER` / `SWAGGER_PASSWORD` (`admin`) |
| http://localhost:8025       | Mailpit inbox                                                               |
| http://localhost:15672      | RabbitMQ management (`nestify` / `secret`)                                  |

### Running the app on the host instead

To keep the fast host-side edit/reload loop, start only the backing services and run the app yourself:

```sh
docker compose -f docker-compose.dev.yml up -d --wait database redis rabbitmq mailpit
pnpm build
NODE_ENV=dev pnpm orm migration:up
USER_PASSWORD=Test@1234 NODE_ENV=dev pnpm orm seeder:run
NODE_ENV=dev pnpm start:dev
```

`just migrate` and `just seed` run the migration and the seeders. The seeder creates an admin and sample
users, all with the password from `USER_PASSWORD`.

### Seeding

`SEED_ON_START` defaults to `auto`: the seeders run on the boot that first migrates the database, and are
skipped afterwards. The seeders are not idempotent — `AdminSeeder` and `FixtureSeeder` write fixed emails, so a
second run fails on `user_email_unique` — and `UserSeeder` deliberately generates 50 fresh users every time.

| Value            | Behaviour                                               |
| ---------------- | ------------------------------------------------------- |
| `auto` (default) | Seed only when the database had no migrations yet       |
| `always`         | Seed on every boot; only safe against an empty database |
| `never`          | Never seed                                              |

```sh
SEED_ON_START=never docker compose -f docker-compose.dev.yml up
```

The seed password comes from `USER_PASSWORD`, overridable in the environment the same way.

`docker-compose.yml` is the production-style stack (Traefik, TLS, pgAdmin). It reads `env/.env.${ENV}` and its
own `${PASSWORD}` variable, so it does not share the local sample values above.

## Everyday commands

| Command                                  | What                                              |
| ---------------------------------------- | ------------------------------------------------- |
| `pnpm test`                              | Unit specs (`src/**/*.spec.ts`)                   |
| `just test-e2e`                          | E2E specs, needs the services above running       |
| `pnpm lint` / `pnpm format:check`        | oxlint and oxfmt                                  |
| `pnpm build`                             | Type check and compile to `dist/`                 |
| `pnpm build:swc`                         | SWC transpile, no type check — [docs](swc.md)     |
| `NODE_ENV=dev pnpm orm migration:create` | Generate a migration from entity changes          |
| `NODE_ENV=dev pnpm orm migration:down`   | Roll back the last migration                      |
| `just encryption`                        | Generate `ENC_KEY` and `ENC_IV`                   |
| `pnpm test:cov:check`                    | Unit specs, then fail any file under 90% coverage |

Generate your own `ENC_KEY` and `ENC_IV` before storing real data: changing them afterwards makes existing
encrypted columns unreadable.

## Stopping

```sh
docker compose -f docker-compose.dev.yml down
```

## More

- [Config](config.md), [database](database.md), [testing](testing.md), [logging](logging.md)
- [Decorators](decorators.md), [naming](naming-cheatsheet.md), [linting](linting.md), [timezone](timezone.md), [SWC builds](swc.md)
