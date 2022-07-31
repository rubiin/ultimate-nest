import {AppUtils} from "@common/helpers/app.utils";
import {ValidationPipe} from "@common/pipes/validation";
import {Logger} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {NestFactory, repl} from "@nestjs/core";
import {ExpressAdapter, NestExpressApplication,} from "@nestjs/platform-express";
import compression from "compression";
import helmet from "helmet";
import {i18nValidationErrorFactory, I18nValidationExceptionFilter,} from "nestjs-i18n";
import {AppModule} from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(
        AppModule,
        new ExpressAdapter(),
        {httpsOptions: AppUtils.ssl(), bufferLogs: true},
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

    // =====================================================
    // configureNestGlobals
    // =====================================================

    const globalPrefix = configService.get<string>("app.prefix");

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            exceptionFactory: i18nValidationErrorFactory,
        }),
    );

    app.useGlobalFilters(
        new I18nValidationExceptionFilter({detailedErrors: false}),
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


    // use nestjs repl to debug
    if (process.env.REPL) {
        await repl(AppModule);
    }

    await app.listen(port);

    new Logger("Bootstrap").log(
        `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
    );
}

(async () => await bootstrap())();
