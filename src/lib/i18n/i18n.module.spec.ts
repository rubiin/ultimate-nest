import { i18nOptions } from "./i18n.module";

describe("i18nOptions", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
  });

  it("watches the translation files and logs outside production", () => {
    process.env.NODE_ENV = "dev";

    const options = i18nOptions();

    expect(options.logging).toBe(true);
    expect(options.loaderOptions.watch).toBe(true);
  });

  // Regression: `watch: true` kept chokidar handles open in production and blocked a clean exit.
  it("turns watchers and logging off in production", () => {
    process.env.NODE_ENV = "production";

    const options = i18nOptions();

    expect(options.logging).toBe(false);
    expect(options.loaderOptions.watch).toBe(false);
  });
});
