import process from "node:process";

import {
  app,
  cloudinary,
  database,
  googleOauth,
  facebookOauth,
  jwt,
  minio,
  rabbitmq,
  redis,
  sentry,
  storage,
  stripe,
  throttle,
  twilio,
  resilience,
} from "./index";

const env = (values: Record<string, string | undefined>) => {
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
};

describe("config factories", () => {
  const snapshot = { ...process.env };

  afterEach(() => {
    for (const key of Object.keys(process.env)) delete process.env[key];
    Object.assign(process.env, snapshot);
  });

  describe("app", () => {
    it("maps every variable and keeps the documented fallbacks", () => {
      env({
        APP_PORT: "3000",
        APP_PREFIX: "v1",
        API_URL: "http://api.test",
        APP_NAME: "app",
        CLIENT_URL: "http://client.test",
        ALLOWED_ORIGINS: "http://a.test,,http://b.test",
        APP_MAX_BODY_SIZE: undefined,
        APP_TRUST_PROXY_HOPS: undefined,
        SWAGGER_USER: "user",
        SWAGGER_PASSWORD: "pass",
      });

      expect(app()).toEqual({
        port: "3000",
        prefix: "v1",
        url: "http://api.test",
        name: "app",
        clientUrl: "http://client.test",
        allowedOrigins: ["http://a.test", "http://b.test"],
        maxBodySize: "1mb",
        trustProxyHops: 0,
        swagger: { password: "pass", username: "user" },
      });
    });

    it("leaves allowedOrigins absent rather than defaulting to a wildcard", () => {
      env({ ALLOWED_ORIGINS: undefined, APP_TRUST_PROXY_HOPS: "2", APP_MAX_BODY_SIZE: "5mb" });

      const config = app();

      expect(config.allowedOrigins).toBeUndefined();
      expect(config.trustProxyHops).toBe(2);
      expect(config.maxBodySize).toBe("5mb");
    });
  });

  describe("cloudinary", () => {
    it("maps the cloudinary credentials", () => {
      env({
        CLOUDINARY_API_KEY: "key",
        CLOUDINARY_API_SECRET: "secret",
        CLOUDINARY_CLOUD_NAME: "cloud",
      });

      expect(cloudinary()).toEqual({ apiKey: "key", apiSecret: "secret", cloudName: "cloud" });
    });
  });

  describe("database", () => {
    it("maps the connection settings and defaults the pool size", () => {
      env({
        DB_HOST: "localhost",
        DB_PORT: "5432",
        DB_USERNAME: "user",
        DB_PASSWORD: "pass",
        DB_DATABASE: "db",
        DB_POOL_MIN: undefined,
        DB_POOL_MAX: undefined,
      });

      expect(database()).toEqual({
        dbName: "db",
        host: "localhost",
        password: "pass",
        pool: { max: 10, min: 2 },
        port: "5432",
        user: "user",
      });
    });

    it("reads the pool bounds when they are set", () => {
      env({ DB_POOL_MIN: "3", DB_POOL_MAX: "30" });

      expect(database().pool).toEqual({ max: 30, min: 3 });
    });
  });

  describe("jwt", () => {
    it("keeps a duration-like expiry as a string and defaults the algorithm", () => {
      env({
        JWT_ACCESS_EXPIRY: "15m",
        JWT_REFRESH_EXPIRY: "7d",
        JWT_ALGORITHM: undefined,
        JWT_SECRET: "secret",
      });

      expect(jwt()).toEqual({
        accessExpiry: "15m",
        algorithm: "HS256",
        refreshExpiry: "7d",
        secret: "secret",
      });
    });

    // Regression guard: env vars are always strings, so the `isNumber` branch must never
    // coerce "3600" into a number the library would then reject as a duration.
    it("keeps a numeric-looking expiry as a string", () => {
      env({ JWT_ACCESS_EXPIRY: "3600", JWT_REFRESH_EXPIRY: "7200", JWT_ALGORITHM: "HS512" });

      expect(jwt()).toMatchObject({
        accessExpiry: "3600",
        algorithm: "HS512",
        refreshExpiry: "7200",
      });
    });
  });

  describe("minio", () => {
    it("parses the port and only enables SSL for the literal string 'true'", () => {
      env({
        MINIO_HOST: "minio.test",
        MINIO_PORT: "9000",
        MINIO_ACCESS_KEY: "access",
        MINIO_SECRET_KEY: "secret",
        MINIO_USE_SSL: "true",
      });

      expect(minio()).toEqual({
        endPoint: "minio.test",
        port: 9000,
        accessKey: "access",
        secretKey: "secret",
        useSSl: true,
      });

      env({ MINIO_USE_SSL: "TRUE" });
      expect(minio().useSSl).toBe(false);
    });
  });

  describe("oauth2", () => {
    it("maps the google credentials", () => {
      env({
        GOOGLE_CALLBACK_URL: "http://google.test",
        GOOGLE_CLIENT_ID: "google-id",
        GOOGLE_CLIENT_SECRET: "google-secret",
      });

      expect(googleOauth()).toEqual({
        callbackUrl: "http://google.test",
        clientId: "google-id",
        secret: "google-secret",
      });
    });

    it("maps the facebook credentials", () => {
      env({
        FACEBOOK_CALLBACK_URL: "http://facebook.test",
        FACEBOOK_CLIENT_ID: "facebook-id",
        FACEBOOK_CLIENT_SECRET: "facebook-secret",
      });

      expect(facebookOauth()).toEqual({
        callbackUrl: "http://facebook.test",
        clientId: "facebook-id",
        secret: "facebook-secret",
      });
    });
  });

  describe("rabbitmq", () => {
    it("maps the broker settings", () => {
      env({
        RABBITMQ_EXCHANGE: "exchange",
        RABBITMQ_DEFAULT_PREFETCH: "10",
        RABBITMQ_URI: "amqp://localhost",
      });

      expect(rabbitmq()).toEqual({
        exchange: "exchange",
        prefetchCount: "10",
        url: "amqp://localhost",
      });
    });
  });

  describe("redis", () => {
    it("coerces the numeric settings", () => {
      env({
        REDIS_HOST: "localhost",
        REDIS_NAMESPACE: "app",
        REDIS_PASSWORD: "pass",
        REDIS_PORT: "6379",
        REDIS_TTL: "60",
        REDIS_USERNAME: "user",
      });

      expect(redis()).toEqual({
        host: "localhost",
        namespace: "app",
        password: "pass",
        port: 6379,
        ttl: 60,
        username: "user",
      });
    });

    // Without a namespace every key is un-prefixed and a clear can no longer be confined
    // to this app, so the value falls back rather than resolving to undefined.
    it("falls back to a default namespace when the variable is unset", () => {
      env({
        REDIS_HOST: "localhost",
        REDIS_PASSWORD: "pass",
        REDIS_PORT: "6379",
        REDIS_TTL: "60",
        REDIS_USERNAME: "user",
      });

      expect(redis().namespace).toBe("ultimate-nest");
    });
  });

  describe("resilience", () => {
    it("coerces the breaker, retry, timeout and upload-bulkhead settings to numbers", () => {
      env({
        RESILIENCE_TIMEOUT_MS: "10000",
        RESILIENCE_RETRY_ATTEMPTS: "3",
        RESILIENCE_BREAKER_FAILURE_RATE: "50",
        RESILIENCE_BREAKER_MINIMUM_CALLS: "10",
        RESILIENCE_BREAKER_OPEN_MS: "30000",
        RESILIENCE_UPLOAD_MAX_CONCURRENT: "5",
        RESILIENCE_UPLOAD_MAX_QUEUE: "10",
      });

      expect(resilience()).toEqual({
        breaker: { failureRateThreshold: 50, minimumCalls: 10, openDuration: 30000 },
        retry: { attempts: 3 },
        timeout: 10000,
        upload: { maxConcurrent: 5, maxQueue: 10 },
      });
    });
  });

  describe("sentry", () => {
    it("maps the optional DSN settings", () => {
      env({ SENTRY_DSN: "https://key@sentry.test/1", SENTRY_ENVIRONMENT: "test" });

      expect(sentry()).toEqual({ dsn: "https://key@sentry.test/1", environment: "test" });
    });
  });

  describe("storage", () => {
    it("defaults to the local driver and exposes the s3 shape", () => {
      env({
        STORAGE_DRIVER: undefined,
        STORAGE_ROOT: undefined,
        STORAGE_SIGNING_KEY: "signing",
        S3_ACCESS_KEY_ID: undefined,
      });

      expect(storage()).toEqual({
        driver: "local",
        root: "storage",
        signingKey: "signing",
        s3: {
          accessKeyId: undefined,
          secretAccessKey: undefined,
          region: undefined,
          endpoint: undefined,
          publicBucket: undefined,
          privateBucket: undefined,
          publicCdnUrl: undefined,
          privateCdnUrl: undefined,
        },
      });
    });

    it("maps the s3 driver with every credential present", () => {
      env({
        STORAGE_DRIVER: "s3",
        STORAGE_ROOT: "var/storage",
        S3_ACCESS_KEY_ID: "id",
        S3_SECRET_ACCESS_KEY: "secret",
        S3_REGION: "eu-central-1",
        S3_ENDPOINT: "https://s3.test",
        S3_PUBLIC_BUCKET: "public",
        S3_PRIVATE_BUCKET: "private",
        S3_PUBLIC_CDN_URL: "https://cdn.test/public",
        S3_PRIVATE_CDN_URL: "https://cdn.test/private",
      });

      expect(storage()).toMatchObject({
        driver: "s3",
        root: "var/storage",
        s3: {
          accessKeyId: "id",
          secretAccessKey: "secret",
          region: "eu-central-1",
          endpoint: "https://s3.test",
          publicBucket: "public",
          privateBucket: "private",
          publicCdnUrl: "https://cdn.test/public",
          privateCdnUrl: "https://cdn.test/private",
        },
      });
    });
  });

  describe("stripe", () => {
    it("maps the optional stripe settings", () => {
      env({ STRIPE_ACCOUNT: "acct", STRIPE_API_KEY: "key", STRIPE_CONNECT: "connect" });

      expect(stripe()).toEqual({ account: "acct", apiKey: "key", connect: "connect" });
    });
  });

  describe("throttle", () => {
    it("maps the throttle settings", () => {
      env({ THROTTLE_LIMIT: "100", THROTTLE_TTL: "60" });

      expect(throttle()).toEqual({ limit: "100", ttl: "60" });
    });
  });

  describe("twilio", () => {
    it("maps the optional twilio settings", () => {
      env({ TWILIO_ACCOUNT_SID: "sid", TWILIO_AUTH_TOKEN: "token", TWILIO_FROM: "+100" });

      expect(twilio()).toEqual({ accountSid: "sid", authToken: "token", from: "+100" });
    });
  });
});
