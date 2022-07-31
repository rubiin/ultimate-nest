import { INestApplication, Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import fs from "node:fs";

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
	setupSwagger: (app: INestApplication): void => {
		const options = new DocumentBuilder()
			.setTitle("Api")
			.addBearerAuth()
			.setDescription(
				"The API description built using swagger OpenApi. You can find out more about Swagger at http://swagger.io",
			)
			.setVersion("1.0")
			.build();

		const document = SwaggerModule.createDocument(app, options);

		SwaggerModule.setup("doc", app, document);
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
