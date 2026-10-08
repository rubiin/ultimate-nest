import { STATUS_CODES } from "node:http";

import { createMock } from "@golevelup/ts-vitest";
import { HttpStatus } from "@nestjs/common";
import { ServerException } from "@mikro-orm/postgresql";

import { QueryFailedFilter } from "./query-failed.filter";

describe("queryFailedFilter", () => {
  let filter: QueryFailedFilter;

  const buildHost = () => {
    const response = createMock<NestifyResponse>();
    const json = vi.fn();
    response.status.mockReturnValue({ json } as never);

    return {
      host: createMock({ switchToHttp: () => ({ getResponse: () => response }) }),
      json,
      response,
    };
  };

  // `ServerException` takes a `cause`, so the driver constraint name has to be
  // set on the thrown error itself.
  const buildException = (name: string) => {
    const exception = new ServerException("constraint failed");

    exception.name = name;

    return exception;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    filter = new QueryFailedFilter();
  });

  it("should return 409 when the constraint name starts with UQ", () => {
    const { host, json } = buildHost();

    filter.catch(buildException("UQ_users_email_key"), host as never);

    expect(json).toHaveBeenCalledWith({
      error: STATUS_CODES[HttpStatus.CONFLICT],
      statusCode: HttpStatus.CONFLICT,
    });
  });

  it("should return 500 for other constraint names", () => {
    const { host, response, json } = buildHost();

    filter.catch(buildException("FK_users_org_id"), host as never);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith({
      error: STATUS_CODES[HttpStatus.INTERNAL_SERVER_ERROR],
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  });

  it("should return 500 when the exception has no name", () => {
    const { host, response } = buildHost();

    filter.catch(buildException(""), host as never);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
