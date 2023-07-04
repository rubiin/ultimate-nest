<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://i.imgur.com/4xiI9Hu.png" width="620" alt="Nest Logo" /></a>
</p>

> ### Blog made using Nestjs + Mikro-orm codebase(backend) containing real world examples (CRUD, auth (password based and oauth), advanced patterns, etc) and batteries included and ever-evolving

<p align="center">
<img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/rubiin/ultimate-nest">
<img alt="Workflow test" src="https://github.com/rubiin/ultimate-nest/actions/workflows/github-ci.yml/badge.svg">
<img alt="GitHub" src="https://img.shields.io/github/license/rubiin/ultimate-nest">
<img alt="Lines of code" src="https://img.shields.io/tokei/lines/github/rubiin/ultimate-nest">
</p>
<p align="center">
<a href="https://www.buymeacoffee.com/XbgWxt567" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-green.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
</p>
<br/>

NOTE: Starting April 18,2022 , the repo has ditched most promises for observables. You can check the latest promised version code at
[commit](https://github.com/rubiin/ultimate-nest/tree/fb06b34f7d36f36195880e600f8f1b5b86f71213)

More on why observables are better than promises can be read [here](https://betterprogramming.pub/observables-vs-promises-which-one-should-you-use-c19aef53c680)

<br/>

## Table of Contents

-   [Prerequisites](#prerequisites)
-   [Getting Started](#getting-started)
-   [Database](#database)
-   [Features Covered](#features-covered)
-   [Available Scripts](#available-scripts)
-   [Setup](#setup)
-   [File Structure](#file-structure)
-   [Authentication](#authentication)
-   [Deployment](#deployment)

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

The example codebase uses [MikroORM](https://mikro-orm.io/) with a Postgres database. Why `Mikroorm`? It is a modern ORM for Node.js based on Data Mapper, Unit of Work and Identity Map patterns. It is fully compatible with TypeScript and provides additional features like support for enums, custom types, MongoDB, transactions, caching, migrations, change tracking, advanced queries, lazy/eager relations and much more.

Copy sample env file and adjust the connection settings and other settings(jwt,redis,mail,etc) respectively on sample env file

`Note`: Env files are kept in env folder. The config validation allows 4 environment ['dev', 'prod', 'test','stage']. The env file name
should be of format .env.[environment] Ex. (.env.dev). The env to use should be provided while running any script as NODE_ENV=dev yarn dev

Start local Postgres server and run `npx cross-env NODE_ENV=dev make migrate` to apply migrations

Now you can start the application witt `npx cross-env NODE_ENV=dev yarn start`.

---

## Features covered:

-   🌐 **I18n** - Internationalization
-   🧵 **Stats** - swagger stats for common server metrics
-   🧵 **Poolifier** - threads for cpu extensive tasks
-   💬 **Twilio** - sms support
-   📱 **NestJS** — latest version
-   🎉 **TypeScript** - Type checking
-   ⚙️ **Dotenv** - Supports environment variables
-   🗝 **Authentication** - JWT, RSA256, oauth
-   🏬 **Authorization** - RBAC with casl
-   🏪 **MikroORM** - Database ORM
-   🏪 **PostgreSQL** - Open-Source Relational Database
-   🧠 **Configuration** - Single config for all
-   📃 **Swagger** - API Documentation
-   🐳 **Docker Compose** - Container Orchestration
-   🔐 **Helmet** - secure HTTP headers
-   😴 **Insomnia** - Insomnia config for endpoints
-   📏 **ESLint** — Pluggable JavaScript linter
-   💖 **Prettier** - Opinionated Code Formatter

## Available Scripts

-   `yarn start` - Start application
-   `yarn start:dev` - Start application in watch mode
-   `yarn start:prod` - Start built application
-   `yarn start:hmr` - Start application with hot module replacement
-   `yarn format` - Formats all the files inside src using prettier with config provided in `.prettierrc`
-   `yarn lint` - Uses eslint to lint all the files inside src with config provided in `.eslintrc.cjs`
-   `yarn orm migration:create` - Uses Mikroorm to create a migration file
-   `yarn orm migration:up` - This command is used to run availablexisting migration files.
-   `yarn orm migration:down` - This command is used to rollback migration.
-   `yarn orm seeder:run` - This command is used to run existing seeders in `src/common/database`.

All the scripts require `NODE_ENV` flag

Additionally, you can also see the scripts in `justfile` which is a cross platform task runner. You can use it by installing [just](https://github.com/casey/just#packages) and then running `just <script>

---

## Setup

-   First if you don't want to use any libs from like redis, mailer etc. replace them from the app.module.tasks
    -   You will also need to remove the config from `validate.config.ts` from line ` load: []`
    -   Also remove the unwanted config variables from the env file
-   Make sure you create a env file under `env` directory with name like `.env.something`.The portion after .env is the `NODE_ENV` value which will be required while running the app
-   Also make sure you have ssl files inside `src/resources/ssl` if you tend to use ssl. Replace the sample files with your ssl files but keep the name same. Additionally

## Migration and seeding

Migrations are used to update the database schema. The migration files are stored in `migrations` directory.

```sh
  npx cross-env NODE_ENV=dev yarn orm migration:up # applies migration for dev env
```

Seeding is used to insert data into the database. The seeding files are stored in `common/database/seeders` directory.

```sh
    npx cross-env USER_PASSWORD=Test@1234 NODE_ENV=dev yarn orm seeder:run   # seeds data for dev env with all user password set as Test@1234
```

## Start application

-   `npx cross-env NODE_ENV=[env name] yarn start`
-   View automatically generated swagger api docs by browsing to `http://localhost:[port]/docs`
-   View automatically generated swagger stats dashboard by browsing to `http://localhost:[port]/stats`. The username and password is the values set in the env file under `SWAGGER_USERNAME` and `SWAGGER_PASS` respectively

## File structure

```text
ultimate-nest
├── env                                           * Contains all configuration files
│   └── .env.example                              * Sample configuration file.
│   └── .env.dev                                  * Configuration file for development environment.
│   └── .env.prod                                 * Configuration file for production environment.
│   └── .env.test                                 * Configuration file for test environment.
├── coverage                                      * Coverage reports after running `yarn test:cov` command.
├── dist                                          * Optimized code for production after `yarn build` is run.
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

This applications uses JSON Web Token (JWT) to handle authentication. The token is passed with each request using the `Authorization` header with `Token` scheme. The JWT authentication middleware handles the validation and authentication of the token.

# Deployment

You need to have `docker` and `docker-compose` (not the compose plugin) installed. Also since we are using `makefiles` for deployment, you need to have `make` installed.

```sh
  ENV=dev sh ./scripts/deploy.sh   # deploys dev environment (.env.dev used)
  ENV=prod sh ./scripts/deploy.sh   # deploys prod environment (.env.prod used)
```

The password for `redis` and `rabbitmq` is `Test@1234` can be changed in the make file under `deploy` script

More docs found at `docs` folder

<h2 align="center">Do you use this template?<br/>Don't be shy to give it a star! ★</h2>

Also if you are into NestJS ecosystem you may be interested in one of my other libs:

[nestjs-easyconfig](https://github.com/rubiin/nestjs-pino)

[![GitHub stars](https://img.shields.io/github/stars/rubiin/nestjs-easyconfig?style=flat-square)](https://github.com/rubiin/nestjs-easyconfig)
[![npm](https://img.shields.io/npm/dm/nestjs-easyconfig?style=flat-square)](https://www.npmjs.com/package/nestjs-easyconfig)

Platform config manager for nestjs. It supports multiple config files and environment variables.

---

[nestjs-minio](https://github.com/rubiin/nestjs-minio)

[![GitHub stars](https://img.shields.io/github/stars/rubiin/nestjs-minio?style=flat-square)](https://github.com/rubiin/nestjs-minio)
[![npm](https://img.shields.io/npm/dm/nestjs-minio?style=flat-square)](https://www.npmjs.com/package/nestjs-sessminioion)

This is a minio module for Nest.

---

[nestjs-cloudinary](https://github.com/rubiin/nestjs-cloudinary)

[![GitHub stars](https://img.shields.io/github/stars/rubiin/nestjs-cloudinary?style=flat-square)](https://github.com/rubiin/nestjs-cloudinary)
[![npm](https://img.shields.io/npm/dm/nestjs-cloudinary?style=flat-square)](https://www.npmjs.com/package/nestjs-cloudinary)

This is a cloudinary module for Nest.

---

[nestjs-pgpromise](https://github.com/segmentstream/nestjs-injectable)

[![GitHub stars](https://img.shields.io/github/stars/rubiin/nestjs-pgpromise?style=flat-square)](https://github.com/rubiin/nestjs-pgpromise)
[![npm](https://img.shields.io/npm/dm/nestjs-pgpromise?style=flat-square)](https://www.npmjs.com/package/nestjs-pgpromise)

A Module for Utilizing Pg-promise with NestJS

---

Made with ❤️ with opensource.
