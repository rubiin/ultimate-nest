import * as dotenv from "dotenv";
import { Logger } from "@nestjs/common";

let path: string;
switch (process.env.NODE_ENV) {
  case "test":
    path = `${__dirname}/../../env/test.env`;
    break;
  case "prod":
    path = `${__dirname}/../../env/prod.env`;
    break;
  default:
    path = `${__dirname}/../../env/dev.env`;
}
dotenv.config({ path, debug: false });

const config = {
  secret: process.env.JWT_SECRET,
  expiresIn: "30d",
  port: process.env.APP_PORT,
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
};

Logger.log(config);
export default config;
