import {Options} from "@mikro-orm/core";
import {TsMorphMetadataProvider} from "@mikro-orm/reflection";
import {SqlHighlighter} from "@mikro-orm/sql-highlighter";
import {Logger} from "@nestjs/common";
import dotenv from "dotenv";
import dotEnvExpand from "dotenv-expand";

/**
 * This is required to run mikro-orm cli
 *
 */

const logger = new Logger("MikroORM-CLI");

const myEnvironment = dotenv.config({
    path: `${process.cwd()}/env/.env.${process.env.NODE_ENV}`,
});

dotEnvExpand.expand(myEnvironment);

logger.log(`🛠️  Using env ${process.cwd()}/env/.env.${process.env.NODE_ENV}\n`);

const config = {
    dbName: process.env.DB_DATABASE,
    debug: true,
    entities: ["dist/**/*.entity.js"],
    entitiesTs: ["src/**/*.entity.ts"],
    host: process.env.DB_HOST,
    migrations: {
        path: "dist/migrations/",
        pathTs: "src/migrations/",
        tableName: "migrations",
        transactional: true,
    },
    seeder: {
        path: "dist/common/database/seeders/", // path to the folder with seeders
        pathTs: "src/common/database/seeders/", // path to the folder with seeders
        defaultSeeder: "DatabaseSeeder", // default seeder class name
        glob: "!(*.d).{js,ts}", // how to match seeder files (all .js and .ts files, but not .d.ts)
        emit: "ts", // seeder generation mode
    },
    password: process.env.DB_PASSWORD,
    port: +process.env.DB_PORT,
    type: "postgresql",
    logger: logger.log.bind(logger),
    highlighter: new SqlHighlighter(),
    user: process.env.DB_USERNAME,
    metadataProvider: TsMorphMetadataProvider,
} as Options;

export default config;
