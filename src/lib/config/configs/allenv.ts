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
	twilioConfigValidationSchema,
} from "./index";


// this just exports all the config validation schemas as one type to add to processEnv for intellisense


export type AllEnvironment = typeof appConfigValidationSchema &
	typeof databaseConfigValidationSchema &
	typeof mailConfigValidationSchema &
	typeof redisConfigValidationSchema &
	typeof cloudinaryConfigValidationSchema &
	typeof rabbitmqConfigValidationSchema &
	typeof googleOauthConfigValidationSchema &
	typeof facebookOauthConfigValidationSchema &
	typeof throttleConfigValidationSchema &
	typeof jwtConfigValidationSchema &
	typeof twilioConfigValidationSchema;
