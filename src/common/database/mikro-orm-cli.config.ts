import process from "node:process";
import type { Options } from "@mikro-orm/postgresql";
import { defineConfig } from "@mikro-orm/postgresql";
import { Logger } from "@nestjs/common";
import { config as environmentConfig } from "dotenv";
import dotEnvExpand from "dotenv-expand";
import { Migrator } from "@mikro-orm/migrations";
import { SeedManager } from "@mikro-orm/seeder";
import { baseOptions } from "./orm.config";

/**
 *
 *`MikroOrmConfig` is a configuration object for `MikroORM` that is used to
 *This is required to run mikro-orm cli
 * @see https://mikro-orm.io/docs/configuration
 * @see https://mikro-orm.io/docs/cli
 */

const logger = new Logger("MikroORM");

const environment = environmentConfig({
  path: `${process.cwd()}/env/.env.${process.env.NODE_ENV}`,
});

dotEnvExpand.expand(environment);

logger.log(`🛠️ Using env ${process.cwd()}/env/.env.${process.env.NODE_ENV}\n`);

const config: Options = defineConfig({
  ...baseOptions,
  dbName: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  extensions: [Migrator, SeedManager],
});

export default config;
