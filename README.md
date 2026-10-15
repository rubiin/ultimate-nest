<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://i.imgur.com/4xiI9Hu.png" width="620" alt="Nest Logo" /></a>
</p>

> ### Blog made using Nestjs + Mikro-orm codebase(backend) containing real world examples (CRUD, auth (password based and oauth), advanced patterns, etc) and batteries included and ever-evolving

<p align="center">
<img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/rubiin/ultimate-nest">
<img alt="Workflow test" src="https://github.com/rubiin/ultimate-nest/actions/workflows/github-ci.yml/badge.svg">
<img alt="GitHub" src="https://img.shields.io/github/license/rubiin/ultimate-nest">
<img alt="GitHub" src="https://img.shields.io/github/commit-activity/w/rubiin/ultimate-nest">

</p>
<p align="center">
<a href="https://www.buymeacoffee.com/XbgWxt567" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-green.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
</p>
<br/>

NOTE: Starting April 18,2022 , the repo has ditched most promises for observables. You can check the latest promised
version code at
[commit](https://github.com/rubiin/ultimate-nest/tree/fb06b34f7d36f36195880e600f8f1b5b86f71213)

More on why observables are better than promises can be
read [here](https://betterprogramming.pub/observables-vs-promises-which-one-should-you-use-c19aef53c680)

<br/>

## Table of Contents

- [What's included](#whats-included)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Configuration](#configuration)
- [Project structure](#project-structure)
- [Authentication](#authentication)
- [Deployment](#deployment)
- [Documentation](#documentation)

## What's included

- 📱 [**NestJS**](https://docs.nestjs.com) and 🎉 [**TypeScript**](https://www.typescriptlang.org/)
- 🏪 [**MikroORM**](https://mikro-orm.io/) on 🐘 [**PostgreSQL**](https://www.postgresql.org/), with migrations and seeders
- 🗝 **Authentication** with JWT access and refresh tokens, OAuth (Google, Facebook), 2FA (TOTP), email verification and session management
- 🏬 [**Authorization**](https://github.com/stalniy/casl) - RBAC with CASL
- 🐇 **RabbitMQ** for background jobs and 🧠 **Redis** for caching
- 📧 **Mail** with templates (SMTP or SES), 💬 [**Twilio**](https://github.com/twilio/twilio-node) and Firebase config, Cloudinary and Minio uploads, Stripe webhooks
- 🛡️ [**Resilience**](https://docs.nestjs.com/reliability/resilience) — timeouts, circuit breakers, bulkheads and fallbacks around Cloudinary, mail and RabbitMQ
- 🌐 **I18n**, 📃 [**Swagger**](https://swagger.io/) API docs and 🧵 [**swagger-stats**](https://github.com/slanatech/swagger-stats/) metrics
- ⚙️ **Config** validated at startup with Zod, one file per integration
- 📏 [**Oxlint**](https://oxc.rs/docs/guide/usage/linter.html) and **Oxfmt**, 🧪 **Vitest**, 🐺 [**Husky**](https://github.com/typicode/husky) git hooks
- 🐳 [**Docker Compose**](https://docs.docker.com/compose/) for deployment

## Prerequisites

- [Node.js](https://nodejs.org/) `24.21.0` or newer (see `.nvmrc`)
- [pnpm](https://pnpm.io), the repo uses `pnpm-lock.yaml` so npm and yarn are not supported
- [Docker](https://www.docker.com/), for local PostgreSQL, Redis, RabbitMQ and a mail catcher
- Optional: [just](https://github.com/casey/just) for the shortcuts in `justfile`

## Getting started

```sh
npx degit rubiin/ultimate-nest my-nest-app   # or use the "Use this template" button
cd my-nest-app
pnpm install
cp env/.env.dev.sample env/.env.dev
```

Then start the backing services, run migrations, seed and start the app. The full walkthrough is in
[docs/getting-started.md](docs/getting-started.md).

Once running, Swagger is at `http://localhost:3000/doc` and the metrics dashboard at
`http://localhost:3000/stats`, which asks for `SWAGGER_USER` and `SWAGGER_PASSWORD` from the env file.

## Scripts

Every script needs `NODE_ENV` (`dev`, `prod`, `test` or `stage`), which selects `env/.env.<NODE_ENV>`.

| Command                           | What                                             |
| --------------------------------- | ------------------------------------------------ |
| `pnpm start:dev`                  | Start in watch mode                              |
| `pnpm build` / `pnpm start:prod`  | Compile to `dist/`, run the build                |
| `pnpm start:hmr`                  | Start with hot module replacement                |
| `pnpm test` / `pnpm test:cov`     | Unit specs, with coverage                        |
| `pnpm test:e2e`                   | E2E specs in `test/`, needs the services running |
| `pnpm lint` / `pnpm format:check` | oxlint and oxfmt                                 |
| `pnpm orm migration:create`       | Generate a migration from entity changes         |
| `pnpm orm migration:up` / `:down` | Apply or roll back migrations                    |
| `pnpm orm seeder:run`             | Run the seeders in `src/common/database/seeders` |

The ORM CLI reads compiled entities from `dist/`, so run `pnpm build` first. `justfile` wraps these, for
example `just migrate`, `just seed` and `just encryption`. Run `just` to list them.

## Configuration

Each integration has its own file in `src/lib/config/configs` with a Zod schema and a `registerAs` block, and
`src/lib/config/config.module.ts` loads them. Every variable is validated at startup, and the app refuses to
boot on a missing or malformed one. `env/.env.sample` lists every variable, and `env/.env.dev.sample` is a
working local setup.

To drop an integration you do not need (for example Redis or Twilio), remove its config from
`config.module.ts`, its schema from `config.validation.ts`, and its variables from your env file. See
[docs/config.md](docs/config.md).

## Project structure

```text
ultimate-nest
├── env                 Env files: .env.sample (template), .env.dev.sample (local), .env.<NODE_ENV> (yours)
├── migrations          MikroORM migrations
├── docs                Guides, start with getting-started.md
├── test                End to end specs
├── src
│   ├── main.ts         Entry point
│   ├── common          Shared code: database base classes, decorators, guards, pipes, DTOs, types
│   ├── entities        MikroORM entities
│   ├── lib             Standalone modules: config, mail, i18n, jwt, cache, casl, rabbit, ...
│   ├── modules         Feature modules: auth, user, post, newsletter, chat, ...
│   ├── resources       Static files: i18n, mail templates
│   └── _mocks_         Shared mocks for unit tests
└── dist                Build output
```

A feature module in `src/modules/<name>` holds its controller, service, module, `dto` folder and colocated
`*.spec.ts` files.

## Authentication

The API uses JSON Web Tokens. Send the access token on each request in the header
`Authorization: Bearer <token>`. Refresh tokens are single-use and rotated on `POST /v1/auth/token/refresh`,
and `GET /v1/auth/sessions` lists the devices a user is logged in on.

## Deployment

You need `docker` and `docker-compose`. The variables the compose file reads are defined in
`docker-compose.yml`.

```sh
ENV=dev sh ./scripts/deploy.sh    # deploys the dev environment (env/.env.dev)
ENV=prod sh ./scripts/deploy.sh   # deploys the prod environment (env/.env.prod)
```

## Documentation

More guides are in [`docs/`](docs): [getting started](docs/getting-started.md), [config](docs/config.md),
[database](docs/database.md), [testing](docs/testing.md), [logging](docs/logging.md),
[resilience](docs/resilience.md), [decorators](docs/decorators.md), [linting](docs/linting.md),
[timezone](docs/timezone.md) and [naming](docs/naming-cheatsheet.md).

<h2 align="center">Do you use this template?<br/>Don't be shy to give it a star! ★</h2>

## Support

<a href="https://www.buymeacoffee.com/XbgWxt567"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=XbgWxt567&button_colour=5F7FFF&font_colour=ffffff&font_family=Cookie&outline_colour=000000&coffee_colour=FFDD00" /></a>

Also if you are into NestJS ecosystem you may be interested in one of my other libs:

[helper-fns](https://github.com/rubiin/helper-fns)

[![GitHub stars](https://img.shields.io/github/stars/rubiin/helper-fns?style=flat-square)](https://github.com/rubiin/helper-fns)
[![npm](https://img.shields.io/npm/dm/helper-fns?style=flat-square)](https://www.npmjs.com/package/helper-fns)

A collection of helper functions for typescrip development. It includes functions for array,object,string,etc

[nestjs-easyconfig](https://github.com/rubiin/nestjs-easyconfig)

[![GitHub stars](https://img.shields.io/github/stars/rubiin/nestjs-easyconfig?style=flat-square)](https://github.com/NestCrafts/nestjs-easyconfig)
[![npm](https://img.shields.io/npm/dm/nestjs-easyconfig?style=flat-square)](https://www.npmjs.com/package/nestjs-easyconfig)

Platform config manager for nestjs. It supports multiple config files and environment variables.

---

[nestjs-minio](https://github.com/rubiin/nestjs-minio)

[![GitHub stars](https://img.shields.io/github/stars/rubiin/nestjs-minio?style=flat-square)](https://github.com/NestCrafts/nestjs-minio)
[![npm](https://img.shields.io/npm/dm/nestjs-minio?style=flat-square)](https://www.npmjs.com/package/nestjs-minio)

This is a minio module for Nest.

---

[nestjs-cloudinary](https://github.com/rubiin/nestjs-cloudinary)

[![GitHub stars](https://img.shields.io/github/stars/rubiin/nestjs-cloudinary?style=flat-square)](https://github.com/NestCrafts/nestjs-cloudinary)
[![npm](https://img.shields.io/npm/dm/nestjs-cloudinary?style=flat-square)](https://www.npmjs.com/package/nestjs-cloudinary)

This is a cloudinary module for Nest.

---

[nestjs-pgpromise](https://github.com/rubiin/nestjs-pgpromise)

[![GitHub stars](https://img.shields.io/github/stars/rubiin/nestjs-pgpromise?style=flat-square)](https://github.com/NestCrafts/nestjs-pgpromise)
[![npm](https://img.shields.io/npm/dm/nestjs-pgpromise?style=flat-square)](https://www.npmjs.com/package/nestjs-pgpromise)

A Module for Utilizing Pg-promise with NestJS

---

## Star History

<a href="https://star-history.dera.page/#rubiin/ultimate-nest&Timeline">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://star-history.dera.page/svg?repos=rubiin/ultimate-nest&type=Timeline&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://star-history.dera.page/svg?repos=rubiin/ultimate-nest&type=Timeline" />
    <img alt="Star History Chart" src="https://star-history.dera.page/svg?repos=rubiin/ultimate-nest&type=Timeline" />
  </picture>
</a>

Made with ❤️ with opensource.
