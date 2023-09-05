import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Logger } from "nestjs-pino";
import { NestPinoModule } from "./pino.module";

/**
 *  Creates a logger instance
 * @returns Promise of a Logger instance
 */
export async function createLogger(): Promise<Logger> {
  @Module({
    imports: [NestPinoModule],
  })
  class TemporaryModule {}

  const temporaryApp = await NestFactory.createApplicationContext(TemporaryModule, {
    // Disable the native logger entirely
    // to avoid falling back to the initial problem
    logger: false,
    // thus we must not crash the app on errors at TempModule
    // initialization, otherwise we won't see any error messages
    abortOnError: false,
  });

  await temporaryApp.close();

  return temporaryApp.get(Logger); // retrieve the created instance
}
