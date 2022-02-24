<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

> ### Instagram clone made using Nestjs + Mikro-orm codebase(backend) containing real world examples (CRUD, auth, advanced patterns, etc)

[![CI](https://github.com/rubiin/ultimate-nest/actions/workflows/github-ci.yml/badge.svg)](https://github.com/rubiin/ultimate-nest/actions/workflows/github-ci.yml)

# Getting started

Clone this repo. Edit the env file and pass in your credentials

## Installation

Install dependencies

```sh
 yarn
```

## Database

<p align="center">
  <a href="https://mikro-orm.io/" target="blank"><img src="https://raw.githubusercontent.com/mikro-orm/mikro-orm/master/docs/static/img/logo-readme.svg?sanitize=true" width="320" alt="Mikro Orm" /></a>
</p>

The example codebase uses [MikroORM](https://mikro-orm.io/) with a Postgres database.

Copy MikroORM config example file and adjust the connection settings and other settings(jwt,redism,mail,etc) respectively on sample env file

Start local Postgres server and run `NODE_ENV=dev yarn orm:up` to apply migrations

Now you can start the application witt `NODE_ENV=dev yarn start.

Note: Env files are kept in env folder. The config validation allows 4 environment ['dev', 'prod', 'test','stage']. The env file name
should be of format .env.[environment] Ex. (.env.test). The env to use should be provided while running any script as NODE_ENV=dev npm run dev

---

## NPM scripts

-   `yarn start` - Start application
-   `yarn start:watch` - Start application in watch mode
-   `yarn test` - run Jest test runner
-   `yarn start:prod` - Build application

---

## Start application

-   `yarn start`
-   Test api by browsing to `http://localhost:[port]/v1/user`
-   View automatically generated swagger api docs by browsing to `http://localhost:[port]/docs`

---

# Authentication

This applications uses JSON Web Token (JWT) to handle authentication. The token is passed with each request using the `Authorization` header with `Token` scheme. The JWT authentication middleware handles the validation and authentication of the token.

Todos

FRONTEND
