import { Logger } from "@nestjs/common";
import { resolve } from "path";
import { DynamicThreadPool } from "poolifier";

const logger = new Logger("ThreadPool");

export const pool = new DynamicThreadPool(7, 20, resolve(__dirname, "workers.js"), {
	errorHandler: error => logger.error(error),
	onlineHandler: () => logger.log("worker is online"),
});
