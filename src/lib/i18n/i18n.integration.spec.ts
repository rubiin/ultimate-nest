import path from "node:path";

import { MinMaxLength } from "@common/decorators/validation/min-max-length.decorator";
import { BadRequestException } from "@nestjs/common";
import { I18nContext, I18nModule, I18nValidationPipe, JsonI18nLoader, t } from "@nestjs/i18n";
import { Test } from "@nestjs/testing";

class Dto {
  @MinMaxLength({ minLength: 5 })
  name!: string;
}

describe("i18n integration", () => {
  let context: I18nContext;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        I18nModule.forRoot({
          defaultLocale: "en",
          supportedLocales: ["en", "np"],
          loader: new JsonI18nLoader({ path: path.join(__dirname, "../../resources/i18n/") }),
        }),
      ],
    }).compile();

    await module.init();
    context = module.get(I18nContext);
  });

  it("fills the constraint placeholder in validation messages", async () => {
    const pipe = new I18nValidationPipe({ transform: true });

    const error = await context
      .run("en", () => pipe.transform({ name: "abc" }, { type: "body", metatype: Dto }))
      .catch((error_: BadRequestException) => error_);

    expect((error as BadRequestException).getResponse()).toMatchObject({
      message: ["name must have minimum length of 5"],
      statusCode: 400,
    });
  });

  it("translates exception keys with args", () => {
    expect(
      context.run("en", () => t("exception.itemDoesNotExist", { args: { item: "User" } })),
    ).toBe("User does not exist or unauthorized!");
  });
});
