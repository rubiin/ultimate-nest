import { STATUS_CODES } from "node:http";

import { createMock } from "@golevelup/ts-vitest";
import { HttpStatus } from "@nestjs/common";
import { ForeignKeyConstraintViolationException } from "@mikro-orm/postgresql";
import { ServerException } from "@mikro-orm/postgresql";
import { UniqueConstraintViolationException } from "@mikro-orm/postgresql";

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

  // These take the raw pg error as `previous` and copy its properties, mirroring
  // what `PostgreSqlExceptionConverter` hands to the driver.
  const buildUniqueViolation = () =>
    new UniqueConstraintViolationException({
      code: "23505",
      constraint: "user_email_key",
      message: 'duplicate key value violates unique constraint "user_email_key"',
      table: "user",
    });

  beforeEach(() => {
    vi.clearAllMocks();

    filter = new QueryFailedFilter();
  });

  it("should return 409 for a unique constraint violation", () => {
    const { host, response, json } = buildHost();

    filter.catch(buildUniqueViolation(), host as never);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(json).toHaveBeenCalledWith({
      error: STATUS_CODES[HttpStatus.CONFLICT],
      statusCode: HttpStatus.CONFLICT,
    });
  });

  it("should return 409 regardless of the constraint name", () => {
    const { host, response } = buildHost();

    // The old check keyed off a `UQ`-prefixed name, which the driver never sets.
    filter.catch(buildUniqueViolation(), host as never);

    expect(buildUniqueViolation().name).toBe("UniqueConstraintViolationException");
    expect(response.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
  });

  it("should return 500 for a foreign key violation", () => {
    const { host, response, json } = buildHost();

    filter.catch(
      new ForeignKeyConstraintViolationException({
        code: "23503",
        constraint: "post_author_id_foreign_key",
        message: 'update or delete on table "post" violates foreign key constraint',
        table: "post",
      }),
      host as never,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith({
      error: STATUS_CODES[HttpStatus.INTERNAL_SERVER_ERROR],
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  });

  it("should return 500 for a generic server exception", () => {
    const { host, response } = buildHost();

    filter.catch(new ServerException("connection terminated"), host as never);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
