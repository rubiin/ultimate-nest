import { CallHandler, ExecutionContext, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { firstValueFrom, of, throwError } from "rxjs";

import { LoggingInterceptor } from "./logger.interceptor";

const build = ({
  method = "GET",
  url = "/posts",
  body = {},
  headers = {},
  statusCode = HttpStatus.OK,
}: Partial<NestifyRequest & NestifyResponse> = {}) =>
  ({
    getHandler: () => function handler() {},
    getClass: () => class Controller {},
    switchToHttp: () => ({
      getRequest: () => ({ body, headers, method, url }),
      getResponse: () => ({ statusCode }),
    }),
  }) as unknown as ExecutionContext;

const handlerOf = (value: unknown): CallHandler => ({ handle: () => of(value) });

describe("LoggingInterceptor", () => {
  let interceptor: LoggingInterceptor;
  let log: ReturnType<typeof vi.spyOn>;
  let warn: ReturnType<typeof vi.spyOn>;
  let error: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
    log = vi.spyOn(Logger.prototype, "log").mockImplementation(() => undefined);
    warn = vi.spyOn(Logger.prototype, "warn").mockImplementation(() => undefined);
    error = vi.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs the incoming request before calling the handler", async () => {
    await firstValueFrom(
      interceptor.intercept(
        build({ body: { title: "hi" }, headers: { "x-trace": "1" } }),
        handlerOf({ ok: true }),
      ),
    );

    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { title: "hi" },
        headers: { "x-trace": "1" },
        message: "Request - GET - /posts",
        method: "GET",
      }),
      "LoggingInterceptor - GET - /posts",
    );
  });

  it("logs the response body on success", async () => {
    await firstValueFrom(
      interceptor.intercept(build({ statusCode: HttpStatus.CREATED }), handlerOf({ id: 1 })),
    );

    expect(log).toHaveBeenLastCalledWith(
      { body: { id: 1 }, message: "Response - 201 - GET - /posts" },
      "LoggingInterceptor - 201 - GET - /posts",
    );
  });

  it("prefixes every log line once a user prefix is set", async () => {
    interceptor.setUserPrefix("user-1");

    await firstValueFrom(interceptor.intercept(build(), handlerOf("ok")));

    expect(log.mock.calls[0]?.[1]).toBe("user-1 - LoggingInterceptor - GET - /posts");
    expect(log.mock.calls[1]?.[1]).toBe("user-1 - LoggingInterceptor - 200 - GET - /posts");
  });

  it("warns for a 4xx HttpException rather than logging it as a server fault", async () => {
    await expect(
      firstValueFrom(
        interceptor.intercept(build(), {
          handle: () => throwError(() => new HttpException("nope", HttpStatus.NOT_FOUND)),
        }),
      ),
    ).rejects.toBeInstanceOf(HttpException);

    expect(warn).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Response - 404 - GET - /posts" }),
      "LoggingInterceptor - 404 - GET - /posts",
    );
    expect(error).not.toHaveBeenCalled();
  });

  it("logs a 5xx HttpException with its stack", async () => {
    await expect(
      firstValueFrom(
        interceptor.intercept(build(), {
          handle: () =>
            throwError(() => new HttpException("boom", HttpStatus.INTERNAL_SERVER_ERROR)),
        }),
      ),
    ).rejects.toBeInstanceOf(HttpException);

    expect(error).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Response - 500 - GET - /posts" }),
      expect.any(String),
      "LoggingInterceptor - 500 - GET - /posts",
    );
    expect(warn).not.toHaveBeenCalled();
  });

  it("logs a non-HttpException error with the request line only", async () => {
    await expect(
      firstValueFrom(
        interceptor.intercept(build(), { handle: () => throwError(() => new Error("kaboom")) }),
      ),
    ).rejects.toThrow("kaboom");

    expect(error).toHaveBeenCalledWith(
      { message: "Response - GET - /posts" },
      expect.stringContaining("kaboom"),
      "LoggingInterceptor - GET - /posts",
    );
  });

  it("includes the user prefix in an error log line", async () => {
    interceptor.setUserPrefix("user-1");

    await expect(
      firstValueFrom(
        interceptor.intercept(build(), { handle: () => throwError(() => new Error("kaboom")) }),
      ),
    ).rejects.toThrow("kaboom");

    expect(error).toHaveBeenCalledWith(
      { message: "Response - GET - /posts" },
      expect.any(String),
      "user-1 - LoggingInterceptor - GET - /posts",
    );
  });
});
