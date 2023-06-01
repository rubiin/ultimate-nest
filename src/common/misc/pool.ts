import path from "node:path";

import { Logger } from "@nestjs/common";
import { DynamicThreadPool } from "poolifier";

const logger = new Logger("ThreadPool");

/* Creating a new thread pool with 7 threads and a maximum of 20 threads. */
export const pool = new DynamicThreadPool(7, 20, path.resolve(__dirname, "workers.js"), {
	errorHandler: error => logger.error(error),
	onlineHandler: () => logger.log("✅ Worker is online"),
});
