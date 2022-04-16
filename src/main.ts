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
import rateLimit from "express-rate-limit";

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(
		AppModule,
		new ExpressAdapter(),
		{ httpsOptions: AppUtils.ssl(), bufferLogs: true },
	);

	AppUtils.killAppWithGrace(app);

	const configService = app.get(ConfigService);

	// ======================================================
	// security
	// ======================================================

	app.enableCors();
	app.use(compression());
	app.enable("trust proxy");
	app.use(helmet());

	app.use(
		rateLimit({
			windowMs: 15 * 60 * 1000, // 15 minutes
			max: 100, // limit each IP to 100 requests per windowMs
			message: "Too many requests from this IP, please try again later",
		}),
	);
	const createAccountLimiter = rateLimit({
		windowMs: 60 * 60 * 1000, // 1 hour window
		max: 60, // start blocking after 3 requests
		message:
			"Too many accounts created from this IP, please try again after an hour",
	});

	app.use("user/register", createAccountLimiter);

	// =====================================================
	// configureNestGlobals
	// =====================================================

	const globalPrefix = configService.get<string>("app.prefix");

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
		}),
	);

	app.setGlobalPrefix(globalPrefix);

	// =========================================================
	// configureNestSwagger
	// =========================================================

	AppUtils.setupSwagger(app);

	// =========================================================
	// configurePinoLogger
	// =========================================================

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
