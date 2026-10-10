import { THROTTLE_LIMIT_RESPONSE } from "@common/constant";

import { CustomThrottlerGuard } from "./throttle.guard";

describe("customThrottlerGuard", () => {
  let guard: CustomThrottlerGuard;

  const getTracker = () =>
    (guard as unknown as { getTracker(request: NestifyRequest): Promise<string> }).getTracker.bind(
      guard,
    );

  // A plain cast rather than `createMock`: that deep-proxies arrays and would
  // hand back a stub in place of a falsy first entry.
  const buildRequest = (ips: string[], ip?: string) => ({ ip, ips }) as unknown as NestifyRequest;

  beforeEach(() => {
    vi.clearAllMocks();

    guard = new CustomThrottlerGuard(
      { get: vi.fn<() => unknown>() } as never,
      {} as never,
      {} as never,
    );
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  it("should prefer the first entry in request.ips", async () => {
    await expect(getTracker()(buildRequest(["10.0.0.1"], "192.168.1.1"))).resolves.toEqual(
      "10.0.0.1",
    );
  });

  it("should fall back to request.ip when ips is empty", async () => {
    await expect(getTracker()(buildRequest([], "192.168.1.1"))).resolves.toEqual("192.168.1.1");
  });

  // Only `ips[0]` is inspected, so an empty leading entry is not skipped over.
  it("should throw when the first entry in ips is empty", async () => {
    await expect(getTracker()(buildRequest(["", "10.0.0.2"]))).rejects.toThrow(
      "Unable to get IP address",
    );
  });

  it("should throw when no address can be resolved", async () => {
    await expect(getTracker()(buildRequest([]))).rejects.toThrow("Unable to get IP address");
  });

  it("should expose the shared throttler error message", () => {
    expect((guard as unknown as { errorMessage: string }).errorMessage).toEqual(
      THROTTLE_LIMIT_RESPONSE,
    );
  });
});
