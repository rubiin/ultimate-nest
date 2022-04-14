import * as fs from "fs";
import { Logger } from "@nestjs/common";

export const ssl = (): { key: Buffer; cert: Buffer } | null => {
	let httpsOptions = null;

	const logger = new Logger("ssl");

	const keyPath = `${__dirname}/resources/ssl/key.pem`;
	const certPath = `${__dirname}/resources/ssl/certificate.pem`;

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
};
