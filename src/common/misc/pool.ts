import path from "node:path";

import { Logger } from "@nestjs/common";
import { DynamicThreadPool, availableParallelism } from "poolifier";

const logger = new Logger("ThreadPool");

/* Creating a new thread pool with half of available threads and a maximum of available threads. */
export const pool = new DynamicThreadPool(Math.floor(availableParallelism() / 2), availableParallelism(), path.resolve(__dirname, "workers.js"), {
  enableTasksQueue: true,
  tasksQueueOptions: {
    concurrency: 8
  },
  errorHandler: error => logger.error(error),
  onlineHandler: () => logger.log("✅ Worker is online"),
})
