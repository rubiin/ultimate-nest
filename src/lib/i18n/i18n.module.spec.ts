import { i18nOptions } from "./i18n.module";

describe("i18nOptions", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
  });

  it("watches the translation files and throws on missing keys outside production", () => {
    process.env.NODE_ENV = "dev";

    const options = i18nOptions();

    expect(options.missingKey).toBe("throw");
    expect(options.loader.options.watch).toBe(true);
  });

  // Regression: `watch: true` kept chokidar handles open in production and blocked a clean exit.
  it("turns watchers off and falls back on missing keys in production", () => {
    process.env.NODE_ENV = "production";

    const options = i18nOptions();

    expect(options.missingKey).toBe("fallback");
    expect(options.loader.options.watch).toBe(false);
  });
});
