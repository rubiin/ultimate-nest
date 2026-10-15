import type { ConfigType } from "@nestjs/config";

import {
  app,
  cloudinary,
  database,
  facebookOauth,
  googleOauth,
  jwt,
  mail,
  minio,
  rabbitmq,
  redis,
  resilience,
  sentry,
  stripe,
  throttle,
  twilio,
  storage,
} from "./configs";

export interface Config {
  app: ConfigType<typeof app>;
  cloudinary: ConfigType<typeof cloudinary>;
  database: ConfigType<typeof database>;
  facebookOauth: ConfigType<typeof facebookOauth>;
  googleOauth: ConfigType<typeof googleOauth>;
  jwt: ConfigType<typeof jwt>;
  redis: ConfigType<typeof redis>;
  mail: ConfigType<typeof mail>;
  rabbitmq: ConfigType<typeof rabbitmq>;
  resilience: ConfigType<typeof resilience>;
  stripe: ConfigType<typeof stripe>;
  sentry: ConfigType<typeof sentry>;
  throttle: ConfigType<typeof throttle>;
  twilio: ConfigType<typeof twilio>;
  minio: ConfigType<typeof minio>;
  storage: ConfigType<typeof storage>;
}
