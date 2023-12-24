/* eslint-disable unicorn/prevent-abbreviations */


/* The `export {};` statement is used to indicate that the file is a module and exports nothing. It is
often used in TypeScript files that only contain type declarations or interfaces, without any actual
code or exports. This statement ensures that the file is treated as a module and not as a script. */
export {};

declare global {

  namespace NodeJS {
    interface ProcessEnv {
      APP_PORT: number
      APP_PREFIX: string
      APP_NAME: string
      NODE_ENV:
        | "dev"
        | "development"
        | "stage"
        | "staging"
        | "test"
        | "testing"
        | "prod"
        | "production"
      API_URL: string
      CLIENT_URL: string
      SWAGGER_USER: string
      ALLOWED_ORIGINS?: string
      SWAGGER_PASSWORD: string

      DB_HOST: string
      DB_PORT: number
      DB_USERNAME: string
      DB_PASSWORD: string
      DB_DATABASE: string

      ENC_IV: string
      ENC_KEY: string

      JWT_ACCESS_EXPIRY: string
      JWT_REFRESH_EXPIRY: string
      MAGIC_LINK_EXPIRY: string
      JWT_SECRET: string

      MAIL_HOST: string
      MAIL_PASSWORD: string
      MAIL_USERNAME: string
      MAIL_PORT: number
      MAIL_SERVER: string
      MAIL_PREVIEW_EMAIL: boolean
      MAIL_BCC_LIST?: string
      MAIL_SENDER_EMAIL: string
      MAIL_TEMPLATE_DIR: string

      CLOUDINARY_CLOUD_NAME: string
      CLOUDINARY_API_KEY: string
      CLOUDINARY_API_SECRET: string

      REDIS_TTL: number
      REDIS_URI: string
      REDIS_HOST: string
      REDIS_PASSWORD: string
      REDIS_USERNAME: string
      REDIS_PORT: number

      RABBITMQ_URI: string
      RABBITMQ_DEFAULT_PREFETCH: number

      SENTRY_DSN: string
      SENTRY_ENVIRONMENT: string

      GOOGLE_CLIENT_ID: string
      GOOGLE_CLIENT_SECRET: string
      GOOGLE_CALLBACK_URL: string

      FACEBOOK_CLIENT_ID: string
      FACEBOOK_CLIENT_SECRET: string
      FACEBOOK_CALLBACK_URL: string

      THROTTLE_LIMIT: string
      THROTTLE_TTL: number
    }
  }

}
