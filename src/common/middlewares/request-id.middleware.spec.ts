import { REQUEST_ID_TOKEN_HEADER } from "@common/constant";
import { createMock } from "@golevelup/ts-vitest";
import { createId, isCuid } from "@paralleldrive/cuid2";

import { RequestIdMiddleware } from "./request-id.middleware";

describe("requestIdMiddleware", () => {
  const setup = (headers: Record<string, string>) => {
    const request = createMock<NestifyRequest>({
      header: (name: string) => headers[name],
      headers,
    });
    const response = createMock<NestifyResponse>();
    const next = vi.fn();

    RequestIdMiddleware(request, response, next);

    return { next, request, response };
  };

  it("should keep an existing valid cuid request id", () => {
    const requestId = createId();
    const { request, response, next } = setup({ [REQUEST_ID_TOKEN_HEADER]: requestId });

    expect(isCuid(request.headers[REQUEST_ID_TOKEN_HEADER]!)).toBe(true);
    expect(request.headers[REQUEST_ID_TOKEN_HEADER]).toBe(requestId);
    expect(response.set).toHaveBeenCalledWith(REQUEST_ID_TOKEN_HEADER, requestId);
    expect(next).toHaveBeenCalled();
  });

  it("should replace an invalid request id", () => {
    const { request, response } = setup({ [REQUEST_ID_TOKEN_HEADER]: "not-a-cuid" });

    const generated = request.headers[REQUEST_ID_TOKEN_HEADER]!;

    expect(generated).not.toBe("not-a-cuid");
    expect(isCuid(generated)).toBe(true);
    expect(response.set).toHaveBeenCalledWith(REQUEST_ID_TOKEN_HEADER, generated);
  });

  it("should generate a request id when the header is null", () => {
    const { request, response, next } = setup({
      [REQUEST_ID_TOKEN_HEADER]: null as unknown as string,
    });

    expect(isCuid(request.headers[REQUEST_ID_TOKEN_HEADER]!)).toBe(true);
    expect(response.set).toHaveBeenCalledWith(
      REQUEST_ID_TOKEN_HEADER,
      request.headers[REQUEST_ID_TOKEN_HEADER],
    );
    expect(next).toHaveBeenCalled();
  });

  // The middleware only regenerates on a null or malformed header, so an absent
  // one is forwarded as `undefined` rather than being filled in.
  it("should leave an absent request id untouched", () => {
    const { request, next } = setup({});

    expect(request.headers[REQUEST_ID_TOKEN_HEADER]).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });
});
