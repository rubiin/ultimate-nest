# Getting started

Get the API running locally. That gives you Postgres, Redis, RabbitMQ and Mailpit in containers, a migrated and
seeded database, and the app on http://localhost:3000.

## Prerequisites

- Node `24.22.0` or newer (pinned in `.nvmrc`)
- [pnpm](https://pnpm.io) — the lockfile is `pnpm-lock.yaml`, do not use npm or yarn
- Docker with Compose v2 (`docker compose`, not `docker-compose`)

## Start it

Three commands:

```sh
pnpm install
pnpm sample
./scripts/deploy.sh build
```

Then open http://localhost:3000/doc.

That is the whole setup. `pnpm sample` writes a working `env/.env.dev` with throwaway credentials, and `deploy.sh`
runs the stack in `docker-compose.dev.yml` — it migrates and seeds the database inside the container before the app
starts serving. `--help` lists everything it can do.

| URL                         | What                                       |
| --------------------------- | ------------------------------------------ |
| http://localhost:3000/doc   | Swagger UI                                 |
| http://localhost:3000/stats | Metrics, basic auth `admin` / `admin`      |
| http://localhost:8025       | Mailpit inbox, catches all outgoing mail   |
| http://localhost:15672      | RabbitMQ management (`nestify` / `secret`) |

## Driving the stack

`./scripts/deploy.sh` takes one verb:

| Command                             | What                                                             |
| ----------------------------------- | ---------------------------------------------------------------- |
| `./scripts/deploy.sh build`         | Rebuild the image and start the stack                            |
| `./scripts/deploy.sh logs`          | Follow the app logs, which carry the build, migrate and seed run |
| `./scripts/deploy.sh logs database` | Follow one service, to see why it is unhealthy                   |
| `./scripts/deploy.sh down`          | Stop the stack, keeping the volumes                              |

The stack always runs detached, so `logs` is how you watch a build. The source is baked into the image rather
than mounted, so **`build` is what you run after any code change** — `up` reuses the image it already has.

Each verb wraps a `docker compose` command, so you can drop down to those directly when you need something the
script does not cover.

## Working on the host

Containers are convenient but reload is slow. For a fast edit/reload loop, start only the backing services and
run the app yourself:

```sh
./scripts/deploy.sh services
pnpm build
just migrate
just seed
pnpm start:dev
```

`just` is optional; the equivalents are `NODE_ENV=dev pnpm orm migration:up` and `pnpm orm seeder:run`.

The seeders create an admin and sample users, all with the password from `USER_PASSWORD`. They run automatically
on the first boot and are then skipped, so you do not normally need `just seed`.

The Cloudinary, Google and Facebook values in the sample are placeholders. The app boots with them, but avatar
uploads and OAuth login fail until you add real credentials.

## Everyday commands

| Command                     | What                                                  |
| --------------------------- | ----------------------------------------------------- |
| `pnpm build`                | Type check and compile to `dist/`                     |
| `pnpm start:dev`            | Watch mode                                            |
| `pnpm test`                 | Unit specs                                            |
| `pnpm lint` / `pnpm format` | oxlint and oxfmt                                      |
| `just quick-migrate`        | Generate a migration from entity changes, then run it |
| `just encryption`           | Generate `ENC_KEY` and `ENC_IV`                       |
| `just test-e2e`             | E2E specs, needs the stack above                      |

Generate your own `ENC_KEY` and `ENC_IV` before storing real data: changing them afterwards makes existing
encrypted columns unreadable.

`docker-compose.yml` is the production-style stack (Traefik, TLS, pgAdmin) and is not part of local setup.

## More

- [Config](config.md), [database](database.md), [testing](testing.md), [logging](logging.md)
- [Decorators](decorators.md), [naming](naming-cheatsheet.md), [linting](linting.md), [timezone](timezone.md), [SWC builds](swc.md)
