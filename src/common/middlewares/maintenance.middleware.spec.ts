import { ERROR_CODES } from "@common/constant";
import { ServiceUnavailableException, UnauthorizedException } from "@nestjs/common";

import { SettingMaintenanceMiddleware } from "./maintenance.middleware";

/**
 * `errorCode` is what lets clients branch on a stable identifier instead of
 * parsing the translated message, so the code has to survive the trip through
 * `HttpException.createBody` into the response body. Two failure modes are
 * pinned here: passing it via the options argument, and passing it for an object
 * response. The base `HttpException` skips `createBody`, so concrete subclasses
 * are used throughout.
 */
describe("errorCode serialization", () => {
  it("is serialized for a string-form response", () => {
    const response = new UnauthorizedException("nope", {
      errorCode: ERROR_CODES.TOKEN_EXPIRED,
    }).getResponse();

    expect(response).toMatchObject({ errorCode: ERROR_CODES.TOKEN_EXPIRED });
  });

  it("is dropped when an object response is combined with the options argument", () => {
    const response = new ServiceUnavailableException(
      { message: "down", statusCode: 503 },
      { errorCode: ERROR_CODES.SERVICE_UNDER_MAINTENANCE },
    ).getResponse();

    expect(response).not.toHaveProperty("errorCode");
  });

  it("survives when placed in the object response body", () => {
    const response = new ServiceUnavailableException({
      errorCode: ERROR_CODES.SERVICE_UNDER_MAINTENANCE,
      message: "down",
      statusCode: 503,
    }).getResponse();

    expect(response).toMatchObject({ errorCode: ERROR_CODES.SERVICE_UNDER_MAINTENANCE });
  });
});

describe("SettingMaintenanceMiddleware", () => {
  const middleware = new SettingMaintenanceMiddleware();

  it("throws a 503 carrying the maintenance errorCode", async () => {
    await expect(middleware.use({} as never, {} as never, vi.fn())).rejects.toMatchObject({
      response: expect.objectContaining({
        errorCode: ERROR_CODES.SERVICE_UNDER_MAINTENANCE,
        statusCode: 503,
      }),
    });
  });
});
