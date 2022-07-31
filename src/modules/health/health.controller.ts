import {Controller, Get} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {
    DiskHealthIndicator,
    HealthCheck,
    HealthCheckService,
    HttpHealthIndicator,
    MemoryHealthIndicator,
} from "@nestjs/terminus";
import {DatabaseHealthIndicator} from "./database.health";

@Controller("health")
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private http: HttpHealthIndicator,
        private disk: DiskHealthIndicator,
        private memory: MemoryHealthIndicator,
        private configService: ConfigService,
        private databaseHealth: DatabaseHealthIndicator,
    ) {
    }

    @Get("test")
    healthCheck() {
        return "Http working fine";
    }

    @Get()
    @HealthCheck()
    check() {
        return this.health.check([
            () =>
                this.http.pingCheck(
                    "swagger",
                    `https://localhost:${this.configService.get(
                        "app.port",
                    )}/doc`,
                ),
            () =>
                this.http.pingCheck(
                    "routes",
                    `https://localhost:${this.configService.get(
                        "app.port",
                    )}/${this.configService.get("app.prefix")}/health/test`,
                ),
            () => this.databaseHealth.isHealthy(),
            async () => this.memory.checkHeap("memory_heap", 200 * 1024 * 1024),
            async () => this.memory.checkRSS("memory_rss", 3000 * 1024 * 1024),
            // The used disk storage should not exceed 50% of the full disk size
            () =>
                this.disk.checkStorage("disk health", {
                    thresholdPercent: 0.5,
                    path: "/",
                }),
            // The used disk storage should not exceed 250 GB
            () =>
                this.disk.checkStorage("disk health", {
                    threshold: 250 * 1024 * 1024 * 1024,
                    path: "/",
                }),
        ]);
    }
}
