import {
  appConfigValidationSchema,
  cloudinaryConfigValidationSchema,
  databaseConfigValidationSchema,
  facebookOauthConfigValidationSchema,
  googleOauthConfigValidationSchema,
  jwtConfigValidationSchema,
  mailConfigValidationSchema,
  rabbitmqConfigValidationSchema,
  redisConfigValidationSchema,
  throttleConfigValidationSchema,
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
  .extend(facebookOauthConfigValidationSchema.shape);
