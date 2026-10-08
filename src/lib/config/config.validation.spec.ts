import { APP_ENVIRONMENTS, VERSION_VALIDATION_MESSAGE } from "@common/constant";
import { z } from "zod";

import { configValidationSchema } from "./config.validation";
import { appConfigValidationSchema } from "./configs/app.config";
import { mailConfigValidationSchema } from "./configs/mail.config";

const validAppEnv = {
  API_URL: "http://localhost:3000/api",
  APP_NAME: "ultimate-nest",
  APP_PORT: "3000",
  APP_PREFIX: "v1",
  CLIENT_URL: "http://localhost:5173",
  NODE_ENV: "development",
  SWAGGER_PASSWORD: "swagger-password",
  SWAGGER_USER: "swagger-user",
  TZ: "Asia/Kathmandu",
};

const smtpEnv = {
  MAIL_HOST: "smtp.example.com",
  MAIL_PASSWORD: "secret",
  MAIL_PORT: "465",
  MAIL_SENDER_EMAIL: "no-reply@example.com",
  MAIL_SERVER: "SMTP",
  MAIL_TEMPLATE_DIR: "resources/email",
  MAIL_USERNAME: "user",
};

const sesEnv = {
  MAIL_SENDER_EMAIL: "no-reply@example.com",
  MAIL_SERVER: "SES",
  MAIL_SES_ACCESS_KEY: "access-key",
  MAIL_SES_KEY: "ses-key",
  MAIL_SES_REGION: "eu-central-1",
  MAIL_TEMPLATE_DIR: "resources/email",
};

const issuesFor = (schema: z.ZodType, env: object) =>
  schema.safeParse(env).error?.issues.map((issue) => issue.path.join(".")) ?? [];

const omit = (env: Record<string, string>, keys: string[]) =>
  Object.fromEntries(Object.entries(env).filter(([key]) => !keys.includes(key)));

describe("appConfigValidationSchema", () => {
  it("accepts a complete app env and coerces the port to a number", () => {
    const result = appConfigValidationSchema.parse(validAppEnv);

    expect(result.APP_PORT).toBe(3000);
  });

  it("ignores undeclared variables", () => {
    expect(
      appConfigValidationSchema.safeParse({ ...validAppEnv, SOME_OTHER_VAR: "value" }).success,
    ).toBe(true);
  });

  it.each(APP_ENVIRONMENTS)("accepts NODE_ENV=%s", (env) => {
    expect(appConfigValidationSchema.safeParse({ ...validAppEnv, NODE_ENV: env }).success).toBe(
      true,
    );
  });

  it.each([
    ["an unknown NODE_ENV", { NODE_ENV: "productionn" }],
    ["a missing APP_PORT", { APP_PORT: undefined }],
    ["a non-numeric APP_PORT", { APP_PORT: "not-a-port" }],
    ["an out of range APP_PORT", { APP_PORT: "70000" }],
    ["an empty APP_PORT", { APP_PORT: "" }],
    ["an empty APP_NAME", { APP_NAME: "" }],
    ["a non-url API_URL", { API_URL: "not-a-url" }],
    ["a missing TZ", { TZ: undefined }],
    ["an invalid TZ", { TZ: "Mars/Olympus" }],
  ])("rejects %s", (_, override) => {
    expect(issuesFor(appConfigValidationSchema, { ...validAppEnv, ...override })).not.toEqual([]);
  });

  it("reports the shared version message for a bad APP_PREFIX", () => {
    const result = appConfigValidationSchema.safeParse({ ...validAppEnv, APP_PREFIX: "1" });

    expect(result.error?.issues[0].message).toBe(VERSION_VALIDATION_MESSAGE);
  });
});

describe("mailConfigValidationSchema", () => {
  it("accepts SMTP credentials and defaults MAIL_PREVIEW_EMAIL to false", () => {
    const result = mailConfigValidationSchema.parse(smtpEnv);

    expect(result.MAIL_PREVIEW_EMAIL).toBe(false);
    expect(result.MAIL_PORT).toBe(465);
  });

  it('coerces MAIL_PREVIEW_EMAIL without treating the string "false" as truthy', () => {
    expect(
      mailConfigValidationSchema.parse({ ...smtpEnv, MAIL_PREVIEW_EMAIL: "false" })
        .MAIL_PREVIEW_EMAIL,
    ).toBe(false);
    expect(
      mailConfigValidationSchema.parse({ ...smtpEnv, MAIL_PREVIEW_EMAIL: "true" })
        .MAIL_PREVIEW_EMAIL,
    ).toBe(true);
  });

  it("requires the SMTP credentials when MAIL_SERVER is SMTP", () => {
    const env = omit(smtpEnv, ["MAIL_HOST", "MAIL_PASSWORD", "MAIL_PORT", "MAIL_USERNAME"]);

    expect(issuesFor(mailConfigValidationSchema, env).sort()).toEqual([
      "MAIL_HOST",
      "MAIL_PASSWORD",
      "MAIL_PORT",
      "MAIL_USERNAME",
    ]);
  });

  it("requires the SES credentials when MAIL_SERVER is SES", () => {
    const env = omit(sesEnv, ["MAIL_SES_ACCESS_KEY", "MAIL_SES_KEY", "MAIL_SES_REGION"]);

    expect(issuesFor(mailConfigValidationSchema, env).sort()).toEqual([
      "MAIL_SES_ACCESS_KEY",
      "MAIL_SES_KEY",
      "MAIL_SES_REGION",
    ]);
  });

  it("does not require SES credentials for SMTP", () => {
    expect(mailConfigValidationSchema.safeParse(smtpEnv).success).toBe(true);
  });

  it("rejects an unknown MAIL_SERVER", () => {
    expect(
      issuesFor(mailConfigValidationSchema, { ...smtpEnv, MAIL_SERVER: "CARRIER_PIGEON" }),
    ).toEqual(["MAIL_SERVER"]);
  });

  it("rejects a MAIL_SES_REGION outside SES_REGIONS", () => {
    expect(
      issuesFor(mailConfigValidationSchema, { ...sesEnv, MAIL_SES_REGION: "eu-north-99" }),
    ).toEqual(["MAIL_SES_REGION"]);
  });

  it("rejects an empty credential instead of treating it as unset", () => {
    expect(issuesFor(mailConfigValidationSchema, { ...smtpEnv, MAIL_PASSWORD: "" })).toEqual([
      "MAIL_PASSWORD",
    ]);
  });
});

describe("configValidationSchema", () => {
  const validEnv = {
    ...validAppEnv,
    ...smtpEnv,
    CLOUDINARY_API_KEY: "cloudinary-key",
    CLOUDINARY_API_SECRET: "cloudinary-secret",
    CLOUDINARY_CLOUD_NAME: "cloudinary-cloud",
    DB_DATABASE: "ultimate_nest",
    DB_HOST: "localhost",
    DB_PASSWORD: "db-password",
    DB_PORT: "5432",
    DB_USERNAME: "db-user",
    FACEBOOK_CALLBACK_URL: "http://localhost:3000/api/facebook/callback",
    FACEBOOK_CLIENT_ID: "facebook-id",
    FACEBOOK_CLIENT_SECRET: "facebook-secret",
    GOOGLE_CALLBACK_URL: "http://localhost:3000/api/google/callback",
    GOOGLE_CLIENT_ID: "google-id",
    GOOGLE_CLIENT_SECRET: "google-secret",
    JWT_ACCESS_EXPIRY: "15m",
    JWT_REFRESH_EXPIRY: "7d",
    JWT_SECRET: "jwt-secret",
    MAGIC_LINK_EXPIRY: "10m",
    RABBITMQ_DEFAULT_PREFETCH: "10",
    RABBITMQ_EXCHANGE: "ultimate-nest",
    RABBITMQ_URI: "amqp://user:pass@localhost:5672",
    REDIS_HOST: "localhost",
    REDIS_PASSWORD: "redis-password",
    REDIS_PORT: "6379",
    REDIS_TTL: "3600",
    REDIS_USERNAME: "redis-user",
    THROTTLE_LIMIT: "100",
    THROTTLE_TTL: "60",
  };

  it("accepts a fully populated env", () => {
    const result = configValidationSchema.parse(validEnv);

    expect(result.THROTTLE_TTL).toBe(60);
    expect(result.REDIS_TTL).toBe(3600);
  });

  it("keeps the mail refinements after composition", () => {
    expect(issuesFor(configValidationSchema, omit(validEnv, ["MAIL_HOST"]))).toEqual(["MAIL_HOST"]);
  });

  it("rejects an invalid JWT expiry", () => {
    expect(
      issuesFor(configValidationSchema, { ...validEnv, JWT_ACCESS_EXPIRY: "forever" }),
    ).toEqual(["JWT_ACCESS_EXPIRY"]);
  });

  it("rejects a JWT secret shorter than 8 characters", () => {
    expect(issuesFor(configValidationSchema, { ...validEnv, JWT_SECRET: "short" })).toEqual([
      "JWT_SECRET",
    ]);
  });

  it("rejects an invalid RABBITMQ_URI", () => {
    expect(
      issuesFor(configValidationSchema, { ...validEnv, RABBITMQ_URI: "http://localhost:5672" }),
    ).toEqual(["RABBITMQ_URI"]);
  });

  it("collects issues from every config instead of stopping at the first", () => {
    expect(
      issuesFor(configValidationSchema, {
        ...validEnv,
        REDIS_TTL: "0",
        THROTTLE_LIMIT: "many",
      }).sort(),
    ).toEqual(["REDIS_TTL", "THROTTLE_LIMIT"]);
  });
});
