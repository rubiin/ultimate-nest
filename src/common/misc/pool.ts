import path from "node:path";

import { Logger } from "@nestjs/common";
import { DynamicThreadPool, PoolEvents, availableParallelism } from "poolifier";
import type { WorkerData, WorkerResponse } from "./workers";

const logger = new Logger("ThreadPool");

/* The `workerFile` constant is creating a file path to the worker file. It uses the `path.join()`
method to join the current directory (`__dirname`) with the `workers` directory and the extension of
the current file (`__filename`). This ensures that the correct worker file is referenced regardless
of the current directory or file name. */
const workerFile = path.join(
  __dirname,
  `workers${path.extname(__filename)}`,
);

/* Creating a new thread pool with half of available threads and a maximum of available threads. */
export const pool = new DynamicThreadPool<
WorkerData,
WorkerResponse
>(Math.floor(availableParallelism() / 2), availableParallelism(), workerFile, {
  enableTasksQueue: true,
  tasksQueueOptions: {
    concurrency: 8,
  },
  errorHandler: error => logger.error(error),
  onlineHandler: () => logger.log("⚡️ Worker is online"),
});

pool.emitter?.on(PoolEvents.ready, () => logger.log("✅ Pool is ready"));
pool.emitter?.on(PoolEvents.busy, () => logger.log("🔵 Pool is busy"));
