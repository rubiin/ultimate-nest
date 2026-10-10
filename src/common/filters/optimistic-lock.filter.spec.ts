import { STATUS_CODES } from "node:http";

import { createMock } from "@golevelup/ts-vitest";
import { OptimisticLockError } from "@mikro-orm/postgresql";
import { HttpStatus } from "@nestjs/common";

import { OptimisticLockFilter } from "./optimistic-lock.filter";

describe("optimisticLockFilter", () => {
  it("should map OptimisticLockError to 409", () => {
    const response = createMock<NestifyResponse>();
    const json = vi.fn<(body: unknown) => void>();
    response.status.mockReturnValue({ json } as never);
    const host = createMock({ switchToHttp: () => ({ getResponse: () => response }) });

    new OptimisticLockFilter().catch(OptimisticLockError.lockFailed("Post"), host as never);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(json).toHaveBeenCalledWith({
      error: STATUS_CODES[HttpStatus.CONFLICT],
      statusCode: HttpStatus.CONFLICT,
    });
  });
});
