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

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Database](#database)
- [Features Covered](#features-covered)
- [Available Scripts](#available-scripts)
- [Setup](#setup)
- [File Structure](#file-structure)
- [Authentication](#authentication)
- [Deployment](#deployment)

## Prerequisites

NodeJS
https://nodejs.org/en/

Typescript
https://www.typescriptlang.org/

PostgresQL
https://www.postgresql.org/

Redis
https://redis.io/

RabbitMQ
https://www.rabbitmq.com

## Getting started

```sh

# 1. Clone the repository or click on "Use this template" button.
npx degit rubiin/ultimate-nest my-nest-app

# 2. Enter your newly-cloned folder.
cd ultimate-nest

# 3. Create Environment variables file.
cp env/.env.example env/.env.dev

# 4. Install dependencies (preferred: pnpm)

 npm install
 pnpm install
 yarn install

```

## Database

<p align="center">
  <a href="https://mikro-orm.io/" target="blank"><img src="https://raw.githubusercontent.com/mikro-orm/mikro-orm/master/docs/static/img/logo-readme.svg?sanitize=true" width="320" alt="Mikro Orm" /></a>
</p>

The example codebase uses [MikroORM](https://mikro-orm.io/) with a Postgres database. Why `Mikroorm`? It is a modern ORM
for Node.js based on Data Mapper, Unit of Work and Identity Map patterns. It is fully compatible with TypeScript and
provides additional features like support for enums, custom types, MongoDB, transactions, caching, migrations, change
tracking, advanced queries, lazy/eager relations and much more.

Copy sample env file and adjust the connection settings and other settings(jwt,redis,mail,etc) respectively on sample
env file

`Note`: Env files are kept in env folder. The config validation allows 4 environment ['dev', 'prod', 'test','stage'].
The env file name
should be of format .env.[environment] Ex. (.env.dev). The env to use should be provided while running any script as
NODE_ENV=dev npm run dev

Start local Postgres server and run `npx cross-env NODE_ENV=dev just migrate` to apply migrations

Now you can start the application witt `npx cross-env NODE_ENV=dev npm run start`.

---

## Whats included

- 🌐 [**I18n**](https://en.wikipedia.org/wiki/Internationalization_and_localization) - Internationalization
- 🧵 [**Stats**](https://github.com/slanatech/swagger-stats/) - Swagger stats for common server metrics
- 🧵 [**Poolifier**](https://github.com/poolifier/poolifier) - Threads for CPU extensive tasks
- 💬 [**Twilio**](https://github.com/twilio/twilio-node) - SMS support
- 📱 [**NestJS**](https://docs.nestjs.com) — Latest version
- 🎉 [**TypeScript**](https://www.typescriptlang.org/) - Type checking
- ⚙️ [**Dotenv**](https://github.com/motdotla/dotenv) - Supports environment variables
- 🗝 [**Authentication**](https://jwt.io/), [RSA256](https://tools.ietf.org/html/rfc7518#section-6.3), [OAuth]([https://oauth.net/](https://docs.nestjs.com/security/authentication) - JWT, RSA256, OAuth
- 🏬 [**Authorization**](https://github.com/stalniy/casl) - RBAC with casl
- 🏪 [**MikroORM**](https://mikro-orm.io/) - Database ORM
- 🏪 [**PostgreSQL**](https://www.postgresql.org/) - Open-Source Relational Database
- 🧠 [**Configuration**](https://docs.nestjs.com/techniques/configuration) - Single config for all
- 📃 [**Swagger**](https://swagger.io/) - API Documentation
- 🐳 [**Docker Compose**](https://docs.docker.com/compose/) - Container Orchestration
- 🔐 [**Helmet**](https://helmetjs.github.io/) - Secure HTTP headers
- 📏 [**ESLint**](https://eslint.org/) — Pluggable JavaScript linter
- ✅ [**Commitlint**](https://commitlint.js.org/) — Checks if your commit messages meet the conventional commit format.
- 🐺 [**Husky**](https://github.com/typicode/husky) — Helps you create Git hooks easily.

## Available Scripts

- `npm run start` - Start application
- `npm run start:dev` - Start application in watch mode
- `npm run start:prod` - Start built application
- `npm run start:hmr` - Start application with hot module replacement
- `npm run lint` - Uses eslint to lint all the files inside src with config provided in `eslint.config.js`
- `npm run orm migration:create` - Uses Mikroorm to create a migration file
- `npm run orm migration:up` - This command is used to run availablexisting migration files.
- `npm run orm migration:down` - This command is used to rollback migration.
- `npm run orm seeder:run` - This command is used to run existing seeders in `src/common/database`.

All the scripts require `NODE_ENV` flag

Additionally, you can also see the scripts in `justfile` which is a cross platform task runner. You can use it by
installing [just](https://github.com/casey/just#packages) and then running `just <script>`. Ex. `just build`

---

## Setup

- First if you don't want to use any libs from like redis, mailer etc. replace them from the app.module.tasks
  - You will also need to remove the config from `validate.config.ts` from line ` load: []`
  - Also remove the unwanted config variables from the env file
- Make sure you create a env file under `env` directory with name like `.env.something`.The portion after .env is
  the `NODE_ENV` value which will be required while running the app

## Migration and seeding

Migrations are used to update the database schema. The migration files are stored in `migrations` directory.

```sh
npx cross-env NODE_ENV=dev npm run orm migration:up # applies migration for dev env
```

Seeding is used to insert data into the database. The seeding files are stored in `common/database/seeders` directory.

```sh
npx cross-env USER_PASSWORD=Test@1234 NODE_ENV=dev npm run orm seeder:run   # seeds data for dev env with all user password set as Test@1234
```

## Start application

- `npx cross-env NODE_ENV=[env name] npm run start`
- View automatically generated swagger api docs by browsing to `http://localhost:[port]/docs`
- View automatically generated swagger stats dashboard by browsing to `http://localhost:[port]/stats`. The username and
  password is the values set in the env file under `SWAGGER_USERNAME` and `SWAGGER_PASS` respectively

## File structure

```text
ultimate-nest
├── env                                           * Contains all configuration files
│   └── .env.example                              * Sample configuration file.
│   └── .env.dev                                  * Configuration file for development environment.
│   └── .env.prod                                 * Configuration file for production environment.
│   └── .env.test                                 * Configuration file for test environment.
├── coverage                                      * Coverage reports after running `npm run test:cov` command.
├── dist                                          * Optimized code for production after `npm run build` is run.
├── src
    └── modules                                   * Folder where specific modules all files are stored
          └── <module>
      │       └── dto                             * Data Transfer Objects.
      │       └── <module>.controller.ts          * Controller file.
      │       └── <module>.module.ts              * root module file for module.
      │       └── <module>.service.ts             * Service file for <module>.
      │       └── <module>.service.spec.ts        * Test file for service.
      │       └── <module>.repository.ts          * Repository file for <module>.
      │       └── <module>.repository.spec.ts     * Test file for repository.
│   └── common                                    * Common helpers function, dto, entity,guards, custom validators,types, exception, decorators etc.
│   └── __mocks__                                 * Fixtures for unit tests.
│   └── libs                                      * Resusable pre configured libraries
│   └── resources                                 * Contains all static resources like ssl, i18n,email templates etc.
│   └── app.module.ts                             * Root module of the application.
│   └── main.ts                                   * The entry file of the application which uses the core function NestFactory to create a Nest application instance.
├── test                                          * End to end test files for the application.

```

# Authentication

This applications uses JSON Web Token (JWT) to handle authentication. The token is passed with each request using
the `Authorization` header with `Token` scheme. The JWT authentication middleware handles the validation and
authentication of the token.

# Deployment

You need to have `docker` and `docker-compose` installed. The image environment variable values can be found at the compose file

```sh
ENV=dev sh ./scripts/deploy.sh   # deploys dev environment (.env.dev used)
ENV=prod sh ./scripts/deploy.sh   # deploys prod environment (.env.prod used)
```

More docs found at `docs` folder

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
[![npm](https://img.shields.io/npm/dm/nestjs-minio?style=flat-square)](https://www.npmjs.com/package/nestjs-sessminioion)

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

<a href="https://star-history.com/#rubiin/ultimate-nest&Timeline">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=rubiin/ultimate-nest&type=Timeline&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=rubiin/ultimate-nest&type=Timeline" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=rubiin/ultimate-nest&type=Timeline" />
  </picture>
</a>

Made with ❤️ with opensource.
