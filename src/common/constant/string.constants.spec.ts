import { capitalize, getPackageJson } from "helper-fns";

import { APP_ENVIRONMENTS, SES_REGIONS, swaggerMetadata } from "./string.constants";

describe("swaggerMetadata", () => {
  it("titles the document after the package name and carries its version", () => {
    const { name, version } = getPackageJson();

    expect(swaggerMetadata()).toEqual({
      description: expect.any(String),
      title: `${capitalize(name)} API Documentation`,
      version,
    });
  });
});

describe("environment and region lists", () => {
  it("lists every production-ish node environment", () => {
    expect(APP_ENVIRONMENTS).toContain("production");
    expect(APP_ENVIRONMENTS).toContain("development");
    expect(APP_ENVIRONMENTS).toContain("test");
  });

  it("lists the SES regions the mail config accepts", () => {
    expect(SES_REGIONS).toContain("eu-central-1");
    expect(SES_REGIONS.every((region) => region.startsWith("us-") || region.length > 0)).toBe(true);
  });
});
