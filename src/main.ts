import { AppUtils } from "@common/helpers";
import { ValidationPipe } from "@common/pipes";
import { IConfig } from "@lib/config/config.interface";
import { createLogger } from "@lib/pino/app.logger";
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
		logger: await createLogger(),
	});

	AppUtils.killAppWithGrace(app);

	const configService = app.get(ConfigService<IConfig, true>);

	const logger = new Logger("Bootstrap");

	// ======================================================
	// security
	// ======================================================

	app.use(compression());
	app.enable("trust proxy");
	app.set("etag", "strong");
	app.use(bodyParser.json({ limit: "10mb" }));
	app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
	app.use(helmet());
	app.enableCors({
		credentials: true,
		methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
		maxAge: 3600,
		origin: configService.get("app.allowedHosts", { infer: true }),
	});
	// =====================================================
	// configureNestGlobals
	// =====================================================

	const globalPrefix = configService.get("app.prefix", { infer: true });

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

	// =========================================================
	// configureWebSocket
	// =========================================================

	const redisIoAdapter = new SocketIOAdapter(app, configService);

	await redisIoAdapter.connectToRedis();
	app.useWebSocketAdapter(redisIoAdapter);

	// =========================================================
	// configureNestSwagger
	// =========================================================

	AppUtils.setupSwagger(app, configService);

	// Starts listening for shutdown hooks

	app.enableShutdownHooks();

	const port = process.env.PORT || configService.get("app.port", { infer: true });
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

	logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
	logger.log(
		`🚦 Accepting request only from: ${configService.get("app.allowedHosts", { infer: true })}`,
	);
	logger.log(`📑 Swagger is running on: http://localhost:${port}/${globalPrefix}/docs`);
};

(async () => await bootstrap())();
