import { IGNORE_CACHING_META } from "@common/constant";
import { CacheService } from "@lib/cache";
import { CACHE_SERVICE, CachePlugin, ICacheService } from "@nestjs-redisx/cache";
import { RedisTestingModule } from "@nestjs-redisx/testing";
import { CallHandler, ExecutionContext } from "@nestjs/common";
import { HttpAdapterHost, Reflector } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import { firstValueFrom, of } from "rxjs";

import { HttpCacheInterceptor } from "./cache.interceptor";
import { ClearCacheInterceptor } from "./clear-cache.interceptor";

class PostController {}
class UserController {}

const httpAdapterHost = {
  httpAdapter: { getRequestUrl: (request: { url: string }) => request.url },
} as unknown as HttpAdapterHost;

function getContext(options: {
  controller: object;
  method: string;
  url: string;
  statusCode?: number;
}): ExecutionContext {
  return {
    getClass: () => options.controller,
    getHandler: () => jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ method: options.method, url: options.url, user: { idx: "user-1" } }),
      getResponse: () => ({ statusCode: options.statusCode ?? 200 }),
    }),
  } as unknown as ExecutionContext;
}

describe("cache interceptors", () => {
  let app: TestingModule;
  let cacheService: ICacheService;
  let httpCache: HttpCacheInterceptor;
  let clearCache: ClearCacheInterceptor;
  let ignoreCaching: boolean;

  beforeEach(async () => {
    ignoreCaching = false;

    app = await Test.createTestingModule({
      imports: [RedisTestingModule.forRoot({ plugins: [new CachePlugin()] })],
      providers: [
        CacheService,
        { provide: Reflector, useValue: { get: () => ignoreCaching } },
        { provide: HttpAdapterHost, useValue: httpAdapterHost },
        HttpCacheInterceptor,
        ClearCacheInterceptor,
      ],
    }).compile();

    await app.init();

    cacheService = app.get<ICacheService>(CACHE_SERVICE);
    httpCache = app.get(HttpCacheInterceptor);
    clearCache = app.get(ClearCacheInterceptor);

    await cacheService.clear();
  });

  afterEach(async () => {
    await app.close();
  });

  const handlerFor = (payload: unknown): { handler: CallHandler; calls: () => number } => {
    const handle = jest.fn().mockImplementation(() => of(payload));

    return { calls: () => handle.mock.calls.length, handler: { handle } as CallHandler };
  };

  it("serves the second identical GET from the cache", async () => {
    const context = getContext({ controller: PostController, method: "GET", url: "/posts" });
    const { handler, calls } = handlerFor({ posts: [] });

    await firstValueFrom(httpCache.intercept(context, handler));
    await expect(firstValueFrom(httpCache.intercept(context, handler))).resolves.toEqual({
      posts: [],
    });
    expect(calls()).toBe(1);
  });

  it(`skips the cache when ${IGNORE_CACHING_META} is set`, async () => {
    ignoreCaching = true;

    const context = getContext({ controller: PostController, method: "GET", url: "/posts" });
    const { handler, calls } = handlerFor({ posts: [] });

    await firstValueFrom(httpCache.intercept(context, handler));
    await firstValueFrom(httpCache.intercept(context, handler));

    expect(calls()).toBe(2);
  });

  it("drops only the mutated resource and keeps the rest of the cache", async () => {
    const postsContext = getContext({ controller: PostController, method: "GET", url: "/posts" });
    const usersContext = getContext({ controller: UserController, method: "GET", url: "/users" });

    const posts = handlerFor({ posts: [] });
    const users = handlerFor({ users: [] });

    await firstValueFrom(httpCache.intercept(postsContext, posts.handler));
    await firstValueFrom(httpCache.intercept(usersContext, users.handler));

    const mutation = getContext({
      controller: PostController,
      method: "POST",
      statusCode: 201,
      url: "/posts",
    });

    await firstValueFrom(clearCache.intercept(mutation, handlerFor({ created: true }).handler));
    await new Promise(resolve => setImmediate(resolve));

    await firstValueFrom(httpCache.intercept(postsContext, posts.handler));
    await firstValueFrom(httpCache.intercept(usersContext, users.handler));

    expect(posts.calls()).toBe(2);
    expect(users.calls()).toBe(1);
  });
});
