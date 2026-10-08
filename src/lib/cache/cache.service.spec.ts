import { CacheService } from "@lib/cache/cache.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { TestingModule } from "@nestjs/testing";
import { Test } from "@nestjs/testing";

describe("cacheService", () => {
  let service: CacheService;

  const cacheManager = { clear: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [CacheService, { provide: CACHE_MANAGER, useValue: cacheManager }],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should clear the underlying cache manager", async () => {
    cacheManager.clear.mockResolvedValue(true);

    await expect(service.resetCache()).resolves.toBe(true);
    expect(cacheManager.clear).toHaveBeenCalled();
  });

  it("should propagate a clear failure", async () => {
    cacheManager.clear.mockRejectedValue(new Error("redis down"));

    await expect(service.resetCache()).rejects.toThrow("redis down");
  });
});
