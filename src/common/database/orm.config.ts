import { HelperService } from "@common/helpers";
import { LoadStrategy } from "@mikro-orm/postgresql";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
import { Logger, NotFoundException } from "@nestjs/common";

import { BaseRepository } from "./base.repository";

const logger = new Logger("MikroORM");

export const baseOptions = {
  entities: ["dist/entities/*.entity.js"],
  entitiesTs: ["src/entities/*.entity.ts"],
  findOneOrFailHandler: (entityName: string, key: any) => {
    return new NotFoundException(`${entityName} not found for ${key}`);
  },
  migrations: {
    // The CLI passes `undefined` for an unnamed migration, not `null`.
    fileName: (timestamp: string, name?: string) => {
      if (!name) return `Migration${timestamp}`;

      return `Migration${timestamp}_${name}`;
    },
    tableName: "migrations", // name of database table with log of executed transactions
    path: "./migrations", // path to the folder with migrations
    pathTs: undefined, // path to the folder with TS migrations (if used, we should put path to compiled files in `path`)
    glob: "!(*.d).{js,ts}", // how to match migration files (all .js and .ts files, but not .d.ts)
    transactional: true, // wrap each migration in a transaction
    allOrNothing: true, // wrap all migrations in master transaction
    snapshot: true, // save snapshot when creating new migrations
  },
  seeder: {
    defaultSeeder: "DatabaseSeeder", // default seeder class name
    glob: "!(*.d).{js,ts}", // how to match seeder files (all .js and .ts files, but not .d.ts)
    path: "./src/common/database/seeders", // TS-only: excluded from the build, run via the tsx CLI loader
    pathTs: undefined, // path to the folder with TS seeders (if used, we should put path to compiled files in `path`)
  },
  logger: logger.log.bind(logger),
  metadataProvider: TsMorphMetadataProvider,
  // Without this, TsMorphMetadataProvider re-analyses the whole AST on every boot.
  metadataCache: { enabled: true },
  highlighter: new SqlHighlighter(),
  debug: !HelperService.isProd(),
  loadStrategy: LoadStrategy.BALANCED,
  entityRepository: BaseRepository,
  registerRequestContext: true,
  pool: {
    max: +(process.env.DB_POOL_MAX ?? 10),
    min: +(process.env.DB_POOL_MIN ?? 2),
  },
};
