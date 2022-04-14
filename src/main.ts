import { AppUtils } from "@common/helpers/app.utils";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import {
	ExpressAdapter,
	NestExpressApplication,
} from "@nestjs/platform-express";
import * as compression from "compression";
import helmet from "helmet";
import { Logger } from "nestjs-pino";
import { AppModule } from "./app.module";
import { setupSwagger } from "./swagger";

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(
		AppModule,
		new ExpressAdapter(),
		{ bufferLogs: true },
	);

	AppUtils.killAppWithGrace(app);

	const configService = app.get(ConfigService);

	// ==================================================
	// configureExpressSettings
	// ==================================================

	app.enableCors();
	app.use(helmet());
	app.use(compression());

	// ==================================================
	// configureNestGlobals
	// ==================================================

	const globalPrefix = configService.get<string>("app.prefix");

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
		}),
	).setGlobalPrefix(globalPrefix);

	// ==================================================
	// configureNestSwagger
	// ==================================================

	setupSwagger(app);

	// ==================================================
	// configurePinoLogger
	// ==================================================

	app.useLogger(app.get(Logger));

	// Starts listening for shutdown hooks
	app.enableShutdownHooks();

	const port = configService.get<number>("app.port", 3000);

	await app.listen(port);

	console.info(
		`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
	);
}

(async () => await bootstrap())();
