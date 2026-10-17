import { HttpStatus } from "@nestjs/common";
import { ExecutionContext } from "@nestjs/common";
import { ROUTE_ARGS_METADATA } from "@nestjs/common/constants";

import { Client } from "./client-info.decorator";
import { ClientTimezone } from "./client-timezone.decorator";
import { Origin } from "./origin.decorator";
import { LoggedInUser } from "./user.decorator";
import { UUIDParam } from "./uuid-param.decorator";

type RouteArg = { index: number; data?: string; factory?: unknown; pipes: unknown[] };

/**
 * `createParamDecorator` hides its factory behind `ROUTE_ARGS_METADATA`, so this recovers it the
 * same way the Nest router does.
 */
const routeArgOf = (target: new () => void, key: string, index = 0) => {
  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, target, key) as Record<string, RouteArg>;
  const entry = Object.values(args).find((arg) => arg.index === index);

  if (!entry) throw new Error(`no route arg at index ${index}`);

  return entry;
};

const factoryOf = (target: new () => void, key: string, index = 0) =>
  routeArgOf(target, key, index).factory as (data: unknown, context: ExecutionContext) => unknown;

const contextWith = (request: object) =>
  ({ switchToHttp: () => ({ getRequest: () => request }) }) as unknown as ExecutionContext;

describe("param decorators", () => {
  describe("LoggedInUser", () => {
    class Controller {
      findOne(@LoggedInUser() _user: object): void {}
      findEmail(@LoggedInUser("email") _email: string): void {}
    }

    const user = { id: "user-id", email: "ada@example.com" };

    it("returns the whole user when no property is requested", () => {
      const factory = factoryOf(Controller, "findOne", 0);

      expect(factory(undefined, contextWith({ user }))).toBe(user);
    });

    it("returns only the requested property", () => {
      const factory = factoryOf(Controller, "findEmail", 0);

      expect(factory("email", contextWith({ user }))).toBe("ada@example.com");
    });
  });

  describe("Client", () => {
    class Controller {
      findOne(@Client() _client: object): void {}
    }

    it("exposes the caller IP and user agent", () => {
      const factory = factoryOf(Controller, "findOne", 0);
      const request = { ip: "10.0.0.1", headers: { "user-agent": "vitest" } };

      expect(factory(undefined, contextWith(request))).toEqual({
        ipAddress: "10.0.0.1",
        userAgent: "vitest",
      });
    });

    it("tolerates a request without headers", () => {
      const factory = factoryOf(Controller, "findOne", 0);

      expect(factory(undefined, contextWith({ ip: "10.0.0.2" }))).toEqual({
        ipAddress: "10.0.0.2",
        userAgent: undefined,
      });
    });
  });

  describe("ClientTimezone", () => {
    class Controller {
      findOne(@ClientTimezone() _timezone: string): void {}
    }

    it("reads the timezone the client advertises", () => {
      const factory = factoryOf(Controller, "findOne", 0);
      const request = { headers: { "x-client-timezone": "Europe/Berlin" } };

      expect(factory(undefined, contextWith(request))).toBe("Europe/Berlin");
    });

    it("falls back to the app default when the header is missing", () => {
      const factory = factoryOf(Controller, "findOne", 0);

      expect(factory(undefined, contextWith({ headers: {} }))).toBe("Asia/Kathmandu");
    });
  });

  describe("Origin", () => {
    class Controller {
      findOne(@Origin() _origin: string): void {}
    }

    it("returns the request origin", () => {
      const factory = factoryOf(Controller, "findOne", 0);

      expect(factory(undefined, contextWith({ headers: { origin: "http://client.test" } }))).toBe(
        "http://client.test",
      );
    });

    it("returns undefined when the origin header is absent", () => {
      const factory = factoryOf(Controller, "findOne", 0);

      expect(factory(undefined, contextWith({ headers: {} }))).toBeUndefined();
    });
  });

  describe("UUIDParam", () => {
    class Controller {
      findOne(@UUIDParam("id") _id: string): void {}
    }

    const uuidPipe = () =>
      routeArgOf(Controller, "findOne").pipes[0] as {
        transform: (value: string) => Promise<string>;
      };

    it("passes a valid uuid through unchanged", async () => {
      await expect(uuidPipe().transform("f47ac10b-58cc-4372-a567-0e02b2c3d479")).resolves.toBe(
        "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      );
    });

    it("rejects a malformed uuid with a 400", async () => {
      await expect(uuidPipe().transform("not-a-uuid")).rejects.toMatchObject({
        statusCode: HttpStatus.BAD_REQUEST,
      });
    });
  });
});
