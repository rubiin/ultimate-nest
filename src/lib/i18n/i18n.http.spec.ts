import { MinMaxLength } from "@common/decorators/validation/min-max-length.decorator";
import { Body, Controller, Get, INestApplication, Post } from "@nestjs/common";
import { I18nValidationPipe } from "@nestjs/i18n";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { NestI18nModule } from "./i18n.module";

class Dto {
  @MinMaxLength({ minLength: 5 })
  name!: string;
}

@Controller("probe")
class ProbeController {
  @Get()
  ping() {
    return { ok: true };
  }

  @Post()
  create(@Body() body: Dto) {
    return body;
  }
}

describe("NestI18nModule over HTTP", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [NestI18nModule],
      controllers: [ProbeController],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new I18nValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(() => app.close());

  it.each([
    ["query", (r: request.Test) => r.query({ lang: "np" }), "np"],
    ["x-lang header", (r: request.Test) => r.set("x-lang", "np"), "np"],
    ["Accept-Language", (r: request.Test) => r.set("Accept-Language", "np,en;q=0.5"), "np"],
    // Keys of `fallbacks` count as supported locales, so the region is kept.
    ["a fallbacks region", (r: request.Test) => r.query({ lang: "np-NP" }), "np-NP"],
  ])("resolves the locale from the %s", async (_name, decorate, expected) => {
    const response = await decorate(request(app.getHttpServer()).get("/probe"));

    expect(response.headers["content-language"]).toBe(expected);
  });

  it("falls back to en for an unsupported locale", async () => {
    const response = await request(app.getHttpServer()).get("/probe").query({ lang: "fr" });

    expect(response.headers["content-language"]).toBe("en");
  });

  it("returns a flat translated 400 for invalid bodies", async () => {
    const response = await request(app.getHttpServer()).post("/probe").send({ name: "abc" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: ["name must have minimum length of 5"],
      error: "Bad Request",
      statusCode: 400,
    });
  });
});
