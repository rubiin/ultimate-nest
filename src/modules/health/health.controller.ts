import { Get } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,

  MemoryHealthIndicator,

  MikroOrmHealthIndicator,
} from "@nestjs/terminus";
import { GenericController } from "@common/decorators";

@GenericController("health", false)
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
    private configService: ConfigService<Configs, true>,
    private databaseHealth: MikroOrmHealthIndicator,
  ) {}

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
                    `${this.configService.get("app.url", {
                        infer: true,
                    })}:${this.configService.get("app.port", { infer: true })}/doc`,
        ),
      () =>
        this.http.pingCheck(
          "routes",
                    `${this.configService.get("app.url", {
                        infer: true,
                    })}:${this.configService.get("app.port", {
                        infer: true,
                    })}/${this.configService.get("app.prefix", { infer: true })}/health/test`,
        ),
      async () => this.databaseHealth.pingCheck("mikroOrm"),
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
