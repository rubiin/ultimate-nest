import { AppUtils } from "@common/helpers/app.utils";
import { ValidationPipe } from "@common/pipes/validation.pipe";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory, repl } from "@nestjs/core";
import { ExpressAdapter, NestExpressApplication } from "@nestjs/platform-express";
import bodyParser from "body-parser";
import { useContainer } from "class-validator";
import compression from "compression";
import helmet from "helmet";
import { i18nValidationErrorFactory, I18nValidationExceptionFilter } from "nestjs-i18n";

import { AppModule } from "./app.module";
import { SocketIOAdapter } from "./socket-io.adapter";

declare const module: any;

const bootstrap = async () => {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, new ExpressAdapter(), {
		httpsOptions: AppUtils.ssl(),
		bufferLogs: true,
	});

	AppUtils.killAppWithGrace(app);

	const configService = app.get(ConfigService);

	// ======================================================
	// security
	// ======================================================

	app.use(compression());
	app.enable("trust proxy");
	app.set("etag", "strong");
	app.use(bodyParser.json({ limit: "10mb" }));
	app.use(bodyParser.urlencoded({ limit: "10mb" }));
	app.use(helmet());
	app.enableCors({
		credentials: true,
		maxAge: 3600,
		origin: "*", // for development use only
	});
	// =====================================================
	// configureNestGlobals
	// =====================================================

	const globalPrefix = configService.get<string>("app.prefix");

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
			forbidUnknownValues: false,
			exceptionFactory: i18nValidationErrorFactory,
		}),
	);

	app.useGlobalFilters(new I18nValidationExceptionFilter({ detailedErrors: false }));
	app.setGlobalPrefix(globalPrefix);
	app.useWebSocketAdapter(new SocketIOAdapter(app));

	// =========================================================
	// configureNestSwagger
	// =========================================================

	AppUtils.setupSwagger(app, {
		user: configService.get("app.swaggerUser"),
		pass: configService.get("app.swaggerPass"),
	});

	// =========================================================
	// configurePinoLogger
	// =========================================================

	app.useLogger(app.get(Logger));

	// Starts listening for shutdown hooks

	app.enableShutdownHooks();

	const port = process.env.PORT || configService.get<number>("app.port");
	const isRepl = process.env.REPL === "true";

	// use nestjs repl to debug
	if (isRepl) {
		await repl(AppModule);
	}

	useContainer(app.select(AppModule), { fallbackOnErrors: true });

	if (module.hot) {
		module.hot.accept();
		module.hot.dispose(() => app.close());
	}

	await app.listen(port);

	new Logger("Bootstrap").log(
		`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
	);
};

(async () => await bootstrap())();
