import path from "node:path";

import { Logger } from "@nestjs/common";
import { DynamicThreadPool, PoolEvents, availableParallelism } from "poolifier";

const logger = new Logger("ThreadPool");

const workerFile = path.join(
  __dirname,
  `workers${path.extname(__filename)}`,
);

/* Creating a new thread pool with half of available threads and a maximum of available threads. */
export const pool = new DynamicThreadPool(Math.floor(availableParallelism() / 2), availableParallelism(), workerFile, {
  enableTasksQueue: true,
  tasksQueueOptions: {
    concurrency: 8,
  },
  errorHandler: error => logger.error(error),
  onlineHandler: () => logger.log("✅ Worker is online"),
});

pool.emitter?.on(PoolEvents.ready, () => logger.log("✅ Pool is ready"));
pool.emitter?.on(PoolEvents.busy, () => logger.log("🔵 Pool is busy"));
