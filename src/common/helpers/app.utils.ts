import fs from "node:fs";

import { SWAGGER_DESCRIPTION, SWAGGER_TITLE } from "@common/constant";
import { INestApplication, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from "@nestjs/swagger";
import { getMiddleware } from "swagger-stats";

export const AppUtils = {
	/* A function that is called when the process receives a signal. */

	gracefulShutdown(app: INestApplication, code: string): void {
		const logger: Logger = new Logger("Graceful Shutdown");

		setTimeout(() => process.exit(1), 5000);
		logger.verbose(`Signal received with code ${code} ⚡.`);
		logger.log("❗Closing http server with grace.");
		app.close().then(() => {
			logger.log("✅ Http server closed.");
			process.exit(0);
		});
	},
	/**
	 *
	 *
	 * @static
	 * @param {INestApplication} app
	 * @memberof AppUtils
	 */

	killAppWithGrace: (app: INestApplication) => {
		process.on("SIGINT", async () => {
			AppUtils.gracefulShutdown(app, "SIGINT");
		});

		// kill -15

		process.on("SIGTERM", async () => {
			AppUtils.gracefulShutdown(app, "SIGTERM");
		});
	},
	setupSwagger: (app: INestApplication, configService: ConfigService): void => {
		const userName = configService.get("app.swaggerUser");
		const passWord = configService.get("app.swaggerPass");
		const appName = configService.get("app.name");

		const options = new DocumentBuilder()
			.setTitle(SWAGGER_TITLE)
			.addBearerAuth()
			.setDescription(SWAGGER_DESCRIPTION)
			.setVersion("1.0")
			.addBearerAuth({
				type: "http",
				scheme: "Bearer",
				bearerFormat: "JWT",
				name: "JWT",
				description: "Enter JWT token",
				in: "header",
			})
			.build();

		const document = SwaggerModule.createDocument(app, options, {});

		/** check if there is Public decorator for each path (action) and its method (findMany / findOne) on each controller */
		/* eslint-disable unicorn/no-array-for-each */
		Object.values((document as OpenAPIObject).paths).forEach((path: any) => {
			Object.values(path).forEach((method: any) => {
				if (Array.isArray(method.security) && method.security.includes("isPublic")) {
					method.security = [];
				}
			});
		});

		app.use(
			getMiddleware({
				swaggerSpec: document,
				authentication: true,
				hostname: appName,
				uriPath: "/stats",
				onAuthenticate: (_request: any, username: string, password: string) => {
					// simple check for username and password
					return username === userName && password === passWord;
				},
			}),
		);

		SwaggerModule.setup("doc", app, document, {
			explorer: true,
			swaggerOptions: {
				docExpansion: "list",
				filter: true,
				showRequestDuration: true,
				persistAuthorization: true,
			},
			customSiteTitle: `${appName} API Documentation`,
		});
	},
	ssl: (): { key: Buffer; cert: Buffer } | null => {
		let httpsOptions = null;

		const logger = new Logger("ssl");

		const keyPath = `${__dirname}/../../resources/ssl/key.pem`;
		const certPath = `${__dirname}/../../resources/ssl/certificate.pem`;

		const ssl = process.env.SSL === "true" ? true : false;
		const isExist = fs.existsSync(keyPath) && fs.existsSync(certPath);

		if (ssl && !isExist) {
			logger.error("❗SSL is enabled but no key and certificate found");
		}

		if (ssl && isExist) {
			httpsOptions = {
				key: fs.readFileSync(keyPath),
				cert: fs.readFileSync(certPath),
			};
		}

		return httpsOptions;
	},
};
