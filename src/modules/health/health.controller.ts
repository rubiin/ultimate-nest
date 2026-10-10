import { BYTE_TO_GB, BYTE_TO_MB } from "@common/@types";
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

const HEAP_THRESHOLD_BYTES = 200 * BYTE_TO_MB;
const RSS_THRESHOLD_BYTES = 3000 * BYTE_TO_MB;
const DISK_THRESHOLD_PERCENT = 0.5;
const DISK_THRESHOLD_BYTES = 250 * BYTE_TO_GB;

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
      async () => this.memory.checkHeap("memory_heap", HEAP_THRESHOLD_BYTES),
      async () => this.memory.checkRSS("memory_rss", RSS_THRESHOLD_BYTES),
      async () =>
        this.disk.checkStorage("disk usage percent", {
          path: "/",
          thresholdPercent: DISK_THRESHOLD_PERCENT,
        }),
      async () =>
        this.disk.checkStorage("disk usage bytes", {
          path: "/",
          threshold: DISK_THRESHOLD_BYTES,
        }),
    ];

    // /doc is only mounted outside production, so pinging it there would always fail.
    if (!HelperService.isProd())
      indicators.unshift(async () => this.http.pingCheck("swagger", `${base}/doc`));

    return this.health.check(indicators);
  }
}
