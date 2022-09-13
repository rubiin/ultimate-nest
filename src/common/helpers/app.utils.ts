import { INestApplication, Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule, OpenAPIObject } from "@nestjs/swagger";
import fs from "node:fs";
import * as swaggerStats from "swagger-stats";

export const AppUtils = {
	/**
	 *
	 *
	 * @static
	 * @param {INestApplication} app
	 * @memberof AppUtils
	 */

	killAppWithGrace: (app: INestApplication) => {
		process.on("SIGINT", async () => {
			setTimeout(() => process.exit(1), 5000);
			await app.close();
			process.exit(0);
		});

		// kill -15

		process.on("SIGTERM", async () => {
			setTimeout(() => process.exit(1), 5000);
			await app.close();
			process.exit(0);
		});
	},
	setupSwagger: (app: INestApplication, { user, pass }: { user: string; pass: string }): void => {
		const options = new DocumentBuilder()
			.setTitle("Api Documentation")
			.addBearerAuth()
			.setDescription(
				"The API description built using swagger OpenApi. You can find out more about Swagger at http://swagger.io",
			)
			.setVersion("1.0")
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
			swaggerStats.getMiddleware({
				swaggerSpec: document,
				authentication: true,
				hostname: "cit",
				uriPath: "/stats",
				onAuthenticate: function (request: any, username: string, password: string) {
					// simple check for username and password
					return username === user && password === pass;
				},
			}),
		);

		SwaggerModule.setup("doc", app, document, {
			explorer: true,
			swaggerOptions: {
				docExpansion: "list",
				filter: true,
				showRequestDuration: true,
			},
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
			logger.error("SSL is enabled but no key and certificate found");
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
