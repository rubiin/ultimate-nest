<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

> ### NestJS + MikroORM codebase containing real world examples (CRUD, auth, advanced patterns, etc)

> Rewrite of https://github.com/lujakob/nestjs-realworld-example-app to MikroORM.

---

# Getting started

## Installation

Install dependencies

    yarn

---

## Database

The example codebase uses [MikroORM](https://mikro-orm.io/) with a Postgres database.

Copy MikroORM config example file and adjust the connection settings and other settings(jwt,redism,mail,etc) respectively on sample env file

Start local Postgres server and run `yarn orm:up` to apply migrations

Now you can start the application witt `yarn start`

---

## NPM scripts

-   `yarn start` - Start application
-   `yarn start:watch` - Start application in watch mode
-   `yarn test` - run Jest test runner
-   `yarn start:prod` - Build application

---

## Start application

-   `yarn start`
-   Test api by browsing to `http://localhost:8000/v1/user`
-   View automatically generated swagger api docs by browsing to `http://localhost:3000/docs`

---

# Authentication

This applications uses JSON Web Token (JWT) to handle authentication. The token is passed with each request using the `Authorization` header with `Token` scheme. The JWT authentication middleware handles the validation and authentication of the token.
