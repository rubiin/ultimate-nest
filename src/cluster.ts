import cluster from "node:cluster";
import os from "node:os";

import { isUndefined } from "@common/helpers";
import { Logger } from "@nestjs/common";

export class Cluster {
	private static readonly loggerService = new Logger(Cluster.name);

	public static createCluster(main: () => Promise<void>): void {
		const cpuCount = Cluster.getCpuCount();

		if (cluster.isPrimary) {
			Cluster.loggerService.log(`Starting cluster with ${cpuCount} workers...`);
			Cluster.loggerService.log(`Master server is running on process ${process.pid}`);

			for (let index = 0; index < cpuCount; index++) {
				Cluster.loggerService.log(`Forking process number ${index + 1}...`);
				cluster.fork();
			}

			cluster.on("exit", worker => {
				Cluster.loggerService.warn(`Worker ${worker.id} died. `);
				Cluster.loggerService.warn("Starting a new worker...");
				cluster.fork();
			});
		} else {
			main();
		}
	}

	private static getCpuCount(): number {
		if (!isUndefined(process.env.WORKERS_COUNT)) {
			return Number.parseInt(process.env.WORKERS_COUNT, 10);
		}
		if (!isUndefined(process.env.NODE_ENV) && process.env.NODE_ENV === "production") {
			return os.cpus().length;
		}

		return 2;
	}
}
