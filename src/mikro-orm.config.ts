import { Options } from "@mikro-orm/core";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import config from "./config/index";

const mikroOrmconfig = {
  type: "postgresql",
  host: config.db.host,
  port: config.db.port,
  username: config.db.username,
  password: config.db.password,
  dbName: config.db.database,
  entities: ["dist/**/*.entity.js"],
  entitiesTs: ["src/**/*.entity.ts"],
  debug: true,
  highlighter: new SqlHighlighter(),
  metadataProvider: TsMorphMetadataProvider,
} as Options;

export default mikroOrmconfig;
