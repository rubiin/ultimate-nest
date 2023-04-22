import "@total-typescript/ts-reset";

import { AppUtils, HelperService } from "@common/helpers";
import { IConfig } from "@lib/config/config.interface";
import { createLogger } from "@lib/pino/app.logger";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory, repl } from "@nestjs/core";
import { ExpressAdapter, NestExpressApplication } from "@nestjs/platform-express";
import bodyParser from "body-parser";
import chalk from "chalk";
import { useContainer } from "class-validator";
import compression from "compression";
import helmet from "helmet";
import { i18nValidationErrorFactory, I18nValidationExceptionFilter } from "nestjs-i18n";

import { AppModule } from "./app.module";
import { SocketIOAdapter } from "./socket-io.adapter";
import { join } from "node:path";
import { existsSync, mkdirSync } from "node:fs";

declare const module: any;

const bootstrap = async () => {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, new ExpressAdapter(), {
		httpsOptions: AppUtils.ssl(),
		logger: await createLogger(),
		snapshot: true,
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
			enableDebugMessages: HelperService.isDev(),
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

	// use nestjs repl to verbose
	if (isRepl) {
		const replServer = await repl(AppModule);
		const logger = new Logger();

		// sets up history file
		const cacheDir = join("node_modules", ".cache");
		if (!existsSync(cacheDir)) mkdirSync(cacheDir);

		replServer.setupHistory(join(cacheDir, ".nestjs_repl_history"), err => {
			if (err) logger.error(err);
		});
	}

	useContainer(app.select(AppModule), { fallbackOnErrors: true });

	if (module.hot) {
		module.hot.accept();
		module.hot.dispose(() => app.close());
	}

	await app.listen(port);

	logger.log(
		`🚀 Application is running on: ${chalk.green(`http://localhost:${port}/${globalPrefix}`)}`,
	);
	logger.log(
		`🚦 Accepting request only from: ${chalk.green(
			`${configService.get("app.allowedHosts", { infer: true })}`,
		)}`,
	);
	logger.log(
		`📑 Swagger is running on: ${chalk.green(`http://localhost:${port}/${globalPrefix}/doc`)}`,
	);
	logger.log(`Server is up. ${chalk.yellow(`+${performance.now() | 0}ms`)}`);
};

(async () => await bootstrap())();
