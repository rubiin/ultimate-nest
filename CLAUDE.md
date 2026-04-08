# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- Build: `npm run build`
- Start dev server: `npm run start:dev`
- Start prod server: `npm run start:prod`
- Lint: `npm run lint`
- Run ORM migrations: `npm run orm migration:up`
- Create migration: `npm run orm migration:create`
- Rollback migration: `npm run orm migration:down`
- Run seeders: `npm run orm seeder:run`
- Run a single test: `npm run test -- -t <testFileOrName>`
- Run tests with coverage: `npm run test:cov`

## Scripts Overview

| Script | Purpose |
|-------|---------|
| `start` | Start application (uses NODE_ENV=prod by default) |
| `start:dev` | Development server with hot reload |
| `start:prod` | Production build execution |
| `lint` | Code linting with oxlint |
| `test` | Run Jest tests |
| `test:cov` | Run tests with coverage report |
| `migration:create` | Generate new MikroORM migration |
| `migration:up` | Apply pending migrations |
| `migration:down` | Rollback last migration |
| `seeder:run` | Load seed data |

## Project Structure Highlights

- **Modules**: Each feature lives in `src/modules/<module>/` with dto, controller, service, repository, specs.
- **Common**: Shared utilities, decorators, guards, pipes in `src/common/`.
- **Entities**: Persisted models under `src/entities/` and repository layer in `src/common/database/base.repository.ts`.
- **Database**: Powered by MikroORM; config in `src/common/database/orm.config.ts`.
- **Entry Point**: `src/main.ts` bootstraps the NestJS app via `NestFactory`.
- **Configuration**: Environment-specific settings in `env/` with validation.

## Key Tools & Patterns

- **NestJS**: Modular architecture, dependency injection, guards, interceptors.
- **MikroORM**: TypeScript ORM with entity-based repositories; migrations under `migrations/`.
- **Testing**: Jest with per-module spec files; run single test using `-t` flag.
- **Linting**: oxlint configured via `.oxlintrc.json`.
- **Utilities**: Common helpers in `src/common/helpers.ts`.

## Frequently Used Files (read via `cat`)

- `src/main.ts` – bootstrap logic.
- `src/common/database/orm.config.ts` – MikroORM options.
- `package.json` – npm scripts.
- `src/common/helpers.ts` – shared helper functions.

## Auto‑Generated Files

- `dist/` – compiled output.
- `coverage/` – test coverage reports.
- `.env.*` – environment files.

**Note**: Always reference files using absolute paths when editing. Use `Edit` tool after reading with `Read`.
