# Work with database

In NestJS Boilerplate uses [Mikroorm](https://www.npmjs.com/package/mikrorm)
and [PostgreSQL](https://www.postgresql.org/) for working with database, and all examples will
for [PostgreSQL](https://www.postgresql.org/), but you can use any database.

---

## Table of Contents

- [Working with database schema](#working-with-database-schema)
    - [Generate migration](#generate-migration)
    - [Run migration](#run-migration)
    - [Revert migration](#revert-migration)
    - [Drop the database and migrate up to the latest version](#drop-the-database-and-migrate-up-to-the-latest-version)
- [Performance optimization](#performance-optimization)
    - [Indexes and Foreign Keys](#indexes-and-foreign-keys)

---

## Working with database schema

### Generate migration

1. Create entity file with extension `.entity.ts`. For example `post.entity.ts`:

    ```ts

    // /src/entities/post.entity.ts
    import { BaseEntity } from "@common/database";
    import { Entity, Property } from "@mikro-orm/postgresql";

    @Entity()
    export class Post extends BaseEntity {
    @Property({
        length: 50,
    })
    activityType?: string;

    @Property({
        length: 50,
    })
    loginType?: string;

    @Property({
        length: 50,
    })
    ipAddress?: string;

    @Property({
        length: 50,
    })
    deviceId?: string;

    @Property()
    status = true;

      // Here any fields what you need
    }

    ```

2. Next, generate migration file:

    ```sh
    NODE_ENV=dev npm run orm migration:create
    ```

3. Apply this migration to database via [npm run run orm migration:up](#run-migration).

### Run migration

```bash
NODE_ENV=dev npm run orm migration:up
```

### Revert migration

```bash
NODE_ENV=dev npm run orm migration:down
```

More info for the migrations can be found at: https://mikro-orm.io/docs/migrations

### Drop the database and migrate up to the latest version

```bash
NODE_ENV=dev npm run orm migration:fresh
```

# Generate Seeds

```bash
NODE_ENV=dev npm run orm seeder:create AuthorSeeder  # generates the class AuthorSeeder under src/common/database/seeders
```

```bash
import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Author } from './author'

export class AuthorSeeder extends Seeder {

  async run(em: EntityManager): Promise<void> {
    // will get persisted automatically
    em.create(Author, {
      name: 'John Snow',
      email: 'snow@wall.st'
    });
  }
}
```

To run the generated seeder:

```bash
NODE_ENV=dev npm run orm seeder:run AuthorSeeder  # runs the authorseeder
```

More info for the seeding can be found at: https://mikro-orm.io/docs/seeding
---

## Performance optimization

### Indexes and Foreign Keys

Don't forget to create `indexes` on the Foreign Keys (FK) columns (if needed), because by default
PostgreSQL [does not automatically add indexes to FK](https://stackoverflow.com/a/970605/18140714).

---


More info for the cli can be found at: https://mikro-orm.io/docs/migrations
