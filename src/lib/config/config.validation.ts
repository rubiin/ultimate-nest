import {
  appConfigValidationSchema,
  cloudinaryConfigValidationSchema,
  databaseConfigValidationSchema,
  facebookOauthConfigValidationSchema,
  googleOauthConfigValidationSchema,
  jwtConfigValidationSchema,
  mailConfigValidationSchema,
  minioConfigValidationSchema,
  rabbitmqConfigValidationSchema,
  redisConfigValidationSchema,
  sentryConfigValidationSchema,
  storageConfigValidationSchema,
  stripeConfigValidationSchema,
  throttleConfigValidationSchema,
  twilioConfigValidationSchema,
} from "./configs";

// Mail is the base on purpose: `ZodObject.extend` carries over the refinements of
// the schema it is called on, but drops the ones of the shapes being merged in.
export const configValidationSchema = mailConfigValidationSchema
  .extend(appConfigValidationSchema.shape)
  .extend(jwtConfigValidationSchema.shape)
  .extend(databaseConfigValidationSchema.shape)
  .extend(redisConfigValidationSchema.shape)
  .extend(cloudinaryConfigValidationSchema.shape)
  .extend(rabbitmqConfigValidationSchema.shape)
  .extend(throttleConfigValidationSchema.shape)
  .extend(googleOauthConfigValidationSchema.shape)
  .extend(facebookOauthConfigValidationSchema.shape)
  // Optional integrations: registered so `getOrThrow("minio")` resolves, but their
  // fields are absent-tolerant so boot does not demand all four services.
  .extend(stripeConfigValidationSchema.shape)
  .extend(sentryConfigValidationSchema.shape)
  .extend(twilioConfigValidationSchema.shape)
  .extend(minioConfigValidationSchema.shape)
  .extend(storageConfigValidationSchema.shape);
