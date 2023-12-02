import process from "node:process";
import { registerAs } from "@nestjs/config";
import Joi from "joi";

export const databaseConfigValidationSchema = {
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().port().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
};

export const database = registerAs("database", () => ({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  user: process.env.DB_USERNAME,
  dbName: process.env.DB_DATABASE,
}));
