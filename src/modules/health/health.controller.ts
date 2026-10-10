import { GenericController } from "@common/decorators";
import { HelperService } from "@common/helpers";
import { Get } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  DiskHealthIndicator,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  MikroOrmHealthIndicator,
} from "@nestjs/terminus";
import { HealthCheck, type HealthIndicatorFunction } from "@nestjs/terminus";

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
  async check() {
    const base = `${this.configService.get("app.url", { infer: true })}:${this.configService.get(
      "app.port",
      { infer: true },
    )}`;

    const indicators: HealthIndicatorFunction[] = [
      async () =>
        this.http.pingCheck(
          "routes",
          `${base}/${this.configService.get("app.prefix", { infer: true })}/health/test`,
        ),
      async () => this.databaseHealth.pingCheck("mikroOrm"),
      async () => this.memory.checkHeap("memory_heap", 200 * 1024 * 1024),
      async () => this.memory.checkRSS("memory_rss", 3000 * 1024 * 1024),
      async () =>
        this.disk.checkStorage("disk usage percent", { path: "/", thresholdPercent: 0.5 }),
      async () =>
        this.disk.checkStorage("disk usage bytes", {
          path: "/",
          threshold: 250 * 1024 * 1024 * 1024,
        }),
    ];

    // /doc is only mounted outside production, so pinging it there would always fail.
    if (!HelperService.isProd())
      indicators.unshift(async () => this.http.pingCheck("swagger", `${base}/doc`));

    return this.health.check(indicators);
  }
}
