import { APP_ENVIRONMENTS, VERSION_VALIDATION_MESSAGE } from "@common/constant";
import { z } from "zod";

import { configValidationSchema } from "./config.validation";
import { appConfigValidationSchema } from "./configs/app.config";
import { databaseConfigValidationSchema } from "./configs/database.config";
import { mail, mailConfigValidationSchema } from "./configs/mail.config";

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

  it("defaults APP_TRUST_PROXY_HOPS to 0 so the client IP is not spoofable", () => {
    expect(appConfigValidationSchema.parse(validAppEnv).APP_TRUST_PROXY_HOPS).toBe(0);
    expect(
      appConfigValidationSchema.parse({ ...validAppEnv, APP_TRUST_PROXY_HOPS: "2" })
        .APP_TRUST_PROXY_HOPS,
    ).toBe(2);
    expect(
      issuesFor(appConfigValidationSchema, { ...validAppEnv, APP_TRUST_PROXY_HOPS: "-1" }),
    ).toEqual(["APP_TRUST_PROXY_HOPS"]);
  });

  it("defaults APP_MAX_BODY_SIZE to 1mb and rejects a unitless value", () => {
    expect(appConfigValidationSchema.parse(validAppEnv).APP_MAX_BODY_SIZE).toBe("1mb");
    expect(
      appConfigValidationSchema.parse({ ...validAppEnv, APP_MAX_BODY_SIZE: "5mb" })
        .APP_MAX_BODY_SIZE,
    ).toBe("5mb");
    expect(
      issuesFor(appConfigValidationSchema, { ...validAppEnv, APP_MAX_BODY_SIZE: "10" }),
    ).toEqual(["APP_MAX_BODY_SIZE"]);
  });

  it("validates ALLOWED_ORIGINS, the variable the config actually reads", () => {
    expect(
      appConfigValidationSchema.safeParse({ ...validAppEnv, ALLOWED_ORIGINS: "http://a.test" })
        .success,
    ).toBe(true);
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

describe("mail config factory", () => {
  const originalEnv = process.env.MAIL_PORT;

  afterEach(() => {
    if (originalEnv === undefined) delete process.env.MAIL_PORT;
    else process.env.MAIL_PORT = originalEnv;
  });

  it("coerces a set MAIL_PORT to a number", () => {
    process.env.MAIL_PORT = "465";

    expect(mail()).toMatchObject({ port: 465 });
  });

  // Regression: `process.env.MAIL_PORT ?? +process.env.MAIL_PORT` never fell through —
  // `+"undefined"` is `NaN`, so an unset port reached the mailer as `NaN` rather than absent.
  it("leaves the port undefined when MAIL_PORT is unset instead of yielding NaN", () => {
    delete process.env.MAIL_PORT;

    const { port } = mail();

    expect(port).toBeUndefined();
  });
});

describe("databaseConfigValidationSchema", () => {
  const validDbEnv = {
    DB_DATABASE: "ultimate_nest",
    DB_HOST: "localhost",
    DB_PASSWORD: "db-password",
    DB_PORT: "5432",
    DB_USERNAME: "db-user",
  };

  it("accepts the documented database env", () => {
    expect(databaseConfigValidationSchema.safeParse(validDbEnv).success).toBe(true);
  });

  it("validates the per-process pool bounds", () => {
    expect(databaseConfigValidationSchema.parse(validDbEnv).DB_POOL_MAX).toBe(10);
    expect(
      databaseConfigValidationSchema.parse({ ...validDbEnv, DB_POOL_MAX: "25" }).DB_POOL_MAX,
    ).toBe(25);
    expect(issuesFor(databaseConfigValidationSchema, { ...validDbEnv, DB_POOL_MAX: "0" })).toEqual([
      "DB_POOL_MAX",
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

  describe("optional integrations (stripe/sentry/twilio/minio)", () => {
    it("accepts an env where none of the four integrations are configured", () => {
      expect(configValidationSchema.safeParse(validEnv).success).toBe(true);
    });

    it("rejects an empty value when an optional integration is partially set", () => {
      expect(issuesFor(configValidationSchema, { ...validEnv, STRIPE_API_KEY: "" })).toEqual([
        "STRIPE_API_KEY",
      ]);
      expect(issuesFor(configValidationSchema, { ...validEnv, TWILIO_ACCOUNT_SID: "" })).toEqual([
        "TWILIO_ACCOUNT_SID",
      ]);
    });

    it("still type-checks the fields when the values are present", () => {
      expect(
        issuesFor(configValidationSchema, {
          ...validEnv,
          MINIO_PORT: "not-a-port",
          MINIO_USE_SSL: "maybe",
          SENTRY_DSN: "",
        }).sort(),
      ).toEqual(["MINIO_PORT", "MINIO_USE_SSL", "SENTRY_DSN"]);
    });
  });
});
