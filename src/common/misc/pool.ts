import { Logger } from "@nestjs/common";
import path from "path";
import { DynamicThreadPool } from "poolifier";

const logger = new Logger("ThreadPool");

export const pool = new DynamicThreadPool(7, 20, path.resolve(__dirname, "workers.js"), {
	errorHandler: error => logger.error(error),
	onlineHandler: () => logger.debug("✅ Worker is online"),
});
