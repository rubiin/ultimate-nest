import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

import { Logger } from "@nestjs/common";
import { repl } from "@nestjs/core";

import { AppModule } from "./modules/app.module";

const logger = new Logger("Repl");

/**
 *  Bootstrap the application
 */
async function bootstrap() {
  const replServer = await repl(AppModule);

  // sets up history file for repl
  const cacheDirectory = join("node_modules", ".cache");

  if (!existsSync(cacheDirectory)) mkdirSync(cacheDirectory);

  replServer.setupHistory(join(cacheDirectory, ".nestjs_repl_history"), (error) => {
    if (error) logger.error(error);
  });
}

// `.catch()` rather than `try/catch` around an un-awaited IIFE, which lets the rejection escape.
bootstrap().catch((error) => {
  logger.error(error);
  process.exit(1);
});
