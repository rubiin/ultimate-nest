import { ConfigService } from "@nestjs/config";
import {
  CircuitOpenError,
  RESILIENCE_MODULE_OPTIONS,
  ResilienceModuleOptions,
  ResilienceService,
} from "@nestjs/resilience";
import { Test } from "@nestjs/testing";

import { NestResilienceModule } from "./resilience.module";

// The values `resilience.config.ts` produces for a plausible production env.
const config = {
  "resilience.breaker": { failureRateThreshold: 50, minimumCalls: 10, openDuration: 30000 },
  "resilience.retry": { attempts: 3 },
  "resilience.timeout": 10000,
  "resilience.upload": { maxConcurrent: 5, maxQueue: 10 },
};

const build = async () => {
  const configService = {
    get: (key: string) => (key in config ? config[key as keyof typeof config] : undefined),
  } as unknown as ConfigService<Configs, true>;

  return Test.createTestingModule({
    imports: [NestResilienceModule],
  })
    .overrideProvider(ConfigService)
    .useValue(configService)
    .compile();
};

describe("NestResilienceModule", () => {
  let module: Awaited<ReturnType<typeof build>>;

  beforeEach(async () => {
    module = await build();
    // Compiling is not enough: the package validates its options in an
    // `onModuleInit`, so an unknown preset, a NaN duration or two breakers
    // configured differently under one name fails here rather than at boot.
    await module.init();
  });

  afterEach(async () => {
    await module.close();
  });

  it("turns the resilience config into one preset per dependency", () => {
    const options = module.get<ResilienceModuleOptions>(RESILIENCE_MODULE_OPTIONS);

    expect(options.presets).toEqual({
      cloudinary: {
        bulkhead: { maxConcurrent: 5, maxQueue: 10 },
        circuitBreaker: { failureRateThreshold: 50, minimumCalls: 10, openDuration: 30000 },
        timeout: 10000,
      },
      mail: {
        circuitBreaker: { failureRateThreshold: 50, minimumCalls: 10, openDuration: 30000 },
        timeout: 10000,
      },
      rabbitmq: {
        circuitBreaker: { failureRateThreshold: 50, minimumCalls: 10, openDuration: 30000 },
        retry: { attempts: 3 },
        timeout: 10000,
      },
    });
  });

  it("gives each preset its own breaker, named after the preset", () => {
    const resilience = module.get(ResilienceService);

    expect(resilience.circuitBreaker("mail").name).toBe("mail");
    expect(resilience.circuitBreaker("cloudinary").name).toBe("cloudinary");
    expect(resilience.circuitBreaker("rabbitmq").name).toBe("rabbitmq");
  });

  // The whole point of a per-dependency preset: a breaker tripped by one caller
  // must shed load for the others. Tripping through the named handle is what a
  // route or a health check does; the policy object is a separate caller.
  it("shares one breaker between the preset's handle and its policy object", async () => {
    const resilience = module.get(ResilienceService);
    const policy = resilience.preset("mail");

    // A composed policy is named for its stages, outermost first, which is what
    // its events and errors are labelled with.
    expect(policy.name).toBe("mail > mail");

    resilience.circuitBreaker("mail").trip();

    await expect(
      policy.execute(() => Promise.reject(new Error("smtp down")), { source: "test" }),
    ).rejects.toBeInstanceOf(CircuitOpenError);
  });

  it("resolves every preset the services ask for", () => {
    const resilience = module.get(ResilienceService);

    expect(() => resilience.preset("cloudinary")).not.toThrow();
    expect(() => resilience.preset("mail")).not.toThrow();
    expect(() => resilience.preset("rabbitmq")).not.toThrow();
  });

  // A bad preset must fail at boot, not on the first request, and the message has
  // to name the option so the env var behind it is findable.
  it("fails to boot on an out-of-range bulkhead", async () => {
    const bad = {
      ...config,
      "resilience.upload": { maxConcurrent: 0, maxQueue: 10 },
    } as Record<string, unknown>;
    const configService = {
      get: (key: string) => bad[key],
    } as unknown as ConfigService<Configs, true>;

    await expect(
      Test.createTestingModule({ imports: [NestResilienceModule] })
        .overrideProvider(ConfigService)
        .useValue(configService)
        .compile()
        .then((built) => built.init()),
    ).rejects.toThrow("presets.cloudinary.bulkhead.maxConcurrent");
  });

  // The broker preset is the only place a retry is switched on, so this is the
  // one retry path in the app that actually runs.
  it("retries the broker publish up to its configured attempt count", async () => {
    const policy = module.get(ResilienceService).preset("rabbitmq");
    let attempts = 0;

    const result = await policy.execute(() => {
      attempts++;

      return attempts < 3 ? Promise.reject(new Error("broker down")) : Promise.resolve("published");
    });

    expect(result).toBe("published");
    expect(attempts).toBe(3);
  });

  it("does not retry the mail preset, which only carries a timeout and a breaker", async () => {
    const policy = module.get(ResilienceService).preset("mail");
    let attempts = 0;

    await expect(
      policy.execute(() => {
        attempts++;

        return Promise.reject(new Error("smtp down"));
      }),
    ).rejects.toThrow("smtp down");

    expect(attempts).toBe(1);
  });
});
