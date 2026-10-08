import { createMock } from "@golevelup/ts-vitest";
import { ServiceUnavailableException } from "@nestjs/common";

import { SettingMaintenanceMiddleware } from "./maintenance.middleware";

describe("settingMaintenanceMiddleware", () => {
  it("should be defined", () => {
    expect(new SettingMaintenanceMiddleware()).toBeDefined();
  });

  it("should reject requests while maintenance mode is on", async () => {
    const middleware = new SettingMaintenanceMiddleware();
    const next = vi.fn();

    await expect(
      middleware.use(createMock<NestifyRequest>(), createMock<NestifyResponse>(), next),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);

    expect(next).not.toHaveBeenCalled();
  });
});
