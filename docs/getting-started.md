# Getting started

Run the API locally against throwaway Postgres, Redis, RabbitMQ and Mailpit containers.

## Prerequisites

- Node `24.21.0` or newer (pinned in `.nvmrc`)
- [pnpm](https://pnpm.io) (the lockfile is `pnpm-lock.yaml`, do not use npm or yarn)
- Docker
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

## 2. Start the backing services

`docker-compose.dev.yml` holds them, with credentials matching `env/.env.dev.sample`. It publishes every port,
because the app runs on the host while the services run in containers.

```sh
docker compose -f docker-compose.dev.yml up -d --wait
```

`--wait` blocks until Postgres, Redis and RabbitMQ report healthy, so the migration in step 3 cannot race an
unready database.

| Service  | Port           | Notes                                                        |
| -------- | -------------- | ------------------------------------------------------------ |
| Postgres | `5432`         |                                                              |
| Redis    | `6379`         | The username is the built-in `default`                       |
| RabbitMQ | `5672`/`15672` | Management UI at http://localhost:15672                      |
| Mailpit  | `1025`/`8025`  | Captures all outgoing mail, read it at http://localhost:8025 |

`docker-compose.yml` is the production-style stack (Traefik, TLS, pgAdmin). It reads `env/.env.${ENV}` and its
own `${PASSWORD}` variable, so it does not share the local sample values above.

## 3. Build, migrate and seed

The ORM CLI loads entities from `dist/`, so build first.

```sh
pnpm build
NODE_ENV=dev pnpm orm migration:up
USER_PASSWORD=Test@1234 NODE_ENV=dev pnpm orm seeder:run
```

`just migrate` and `just seed` run the last two. The seeder creates an admin and sample users, all with the
password from `USER_PASSWORD`.

## 4. Run

```sh
NODE_ENV=dev pnpm start:dev
```

| URL                         | What                                                                        |
| --------------------------- | --------------------------------------------------------------------------- |
| http://localhost:3000/doc   | Swagger UI                                                                  |
| http://localhost:3000/stats | Metrics dashboard, basic auth `SWAGGER_USER` / `SWAGGER_PASSWORD` (`admin`) |
| http://localhost:8025       | Mailpit inbox                                                               |
| http://localhost:15672      | RabbitMQ management (`nestify` / `secret`)                                  |

Routes are prefixed with `APP_PREFIX`, so the API lives under `http://localhost:3000/v1`.

## Everyday commands

| Command                                  | What                                        |
| ---------------------------------------- | ------------------------------------------- |
| `pnpm test`                              | Unit specs (`src/**/*.spec.ts`)             |
| `just test-e2e`                          | E2E specs, needs the services above running |
| `pnpm lint` / `pnpm format:check`        | oxlint and oxfmt                            |
| `pnpm build`                             | Type check and compile to `dist/`           |
| `NODE_ENV=dev pnpm orm migration:create` | Generate a migration from entity changes    |
| `NODE_ENV=dev pnpm orm migration:down`   | Roll back the last migration                |
| `just encryption`                        | Generate `ENC_KEY` and `ENC_IV`             |

Generate your own `ENC_KEY` and `ENC_IV` before storing real data: changing them afterwards makes existing
encrypted columns unreadable.

## Stopping

```sh
docker compose -f docker-compose.dev.yml down
```

## More

- [Config](config.md), [database](database.md), [testing](testing.md), [logging](logging.md)
- [Decorators](decorators.md), [naming](naming-cheatsheet.md), [linting](linting.md), [timezone](timezone.md)
