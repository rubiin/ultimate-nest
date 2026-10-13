import { ConfigModule, ConfigService } from "@nestjs/config";

import { NestCacheModule } from "./cache.module";

type Registration = {
  imports: unknown[];
  inject: unknown[];
  isGlobal: boolean;
  useFactory: (configService: ConfigService<Configs, true>) => Promise<{ ttl: number }>;
};

// The decorator options only exist at import time, so capture them as the module is defined
// instead of reading the call log later.
const { registration } = vi.hoisted(() => ({ registration: { current: null as unknown } }));

vi.mock("@nestjs/cache-manager", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@nestjs/cache-manager")>()),
  CacheModule: {
    registerAsync: (options: unknown) => {
      registration.current = options;

      return options;
    },
  },
}));

describe("NestCacheModule", () => {
  const options = () => registration.current as Registration;

  const configService = (url: string) =>
    ({ getOrThrow: vi.fn<(key: string) => string>(() => url) }) as unknown as ConfigService<
      Configs,
      true
    >;

  it("registers a global cache module that reads the redis config", () => {
    expect(NestCacheModule).toBeDefined();
    expect(options().isGlobal).toBe(true);
    expect(options().imports).toContain(ConfigModule);
    expect(options().inject).toEqual([ConfigService]);
  });

  // Regression: without a TTL entries lived until the next wipe, so a replayed route could
  // return a stale body indefinitely.
  it("expires entries after five minutes instead of living until the next wipe", async () => {
    const service = configService("redis://localhost:6379");

    const { ttl } = await options().useFactory(service);

    expect(ttl).toBe(300_000);
    expect(service.getOrThrow).toHaveBeenCalledWith("redis", { infer: true });
  });
});
