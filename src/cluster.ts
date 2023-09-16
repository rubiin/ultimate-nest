import cluster from "node:cluster";
import os from "node:os";

import { Logger } from "@nestjs/common";
import { isUndefined } from "helper-fns";
import { HelperService } from "@common/helpers";

export class Cluster {
  private static readonly loggerService = new Logger(Cluster.name);

  public static createCluster(main: () => Promise<void>): void {
    const cpuCount = this.getCpuCount();

    if (cluster.isPrimary) {
      this.loggerService.log(`📑 Starting cluster with ${cpuCount} workers...`);
      this.loggerService.log(`📑 Master server is running on process ${process.pid}`);

      for (let index = 0; index < cpuCount; index++) {
        this.loggerService.log(`📑 Forking process number ${index + 1}...`);
        cluster.fork();
      }

      cluster.on("exit", (worker) => {
        this.loggerService.warn(`🚦 Worker ${worker.id} died. `);
        this.loggerService.warn("🚦 Starting a new worker...");
        cluster.fork();
      });
    }
    else {
      main().catch((error: Error) => {
        this.loggerService.error(error);
      });
    }
  }

  private static getCpuCount(): number {
    if (!isUndefined(process.env.WORKERS_COUNT))
      return Number.parseInt(process.env.WORKERS_COUNT, 10);

    if (HelperService.isProd())
      return os.cpus().length;

    return 2;
  }
}
