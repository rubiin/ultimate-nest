import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';
import * as helmet from 'helmet';
import { RequestSanitizerInterceptor } from '@common/interceptor/request-sanitizer.interceptor';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import * as bodyParser from 'body-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as rateLimit from 'express-rate-limit';
import setupSwagger from './swagger';
import { AppUtils } from '@common/helpers/app.utils';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		cors: true,
	});

	AppUtils.killAppWithGrace(app);

	const configService = app.get(ConfigService);

	// ==================================================
	// configureExpressSettings
	// ==================================================

	app.set('etag', 'strong')
		.set('trust proxy', true)
		.use(bodyParser.json({ limit: '50mb' }))
		.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
		.use(helmet())
		//	.use(csurf())         // enable only if maintaining session through cookies
		.use(compression())
		.use(
			rateLimit({
				windowMs: 15 * 60 * 1000, // 15 minutes
				max: 100, // limit each IP to 100 requests per windowMs
			}),
		);

	// ==================================================
	// configureNestGlobals
	// ==================================================

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
		}),
	)
		.useGlobalInterceptors(new RequestSanitizerInterceptor())
		.setGlobalPrefix('v1');

	app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

	// ==================================================
	// configureNestSwagger
	// ==================================================

	if (
		['development', 'staging'].includes(
			configService.get<string>('app.environment'),
		)
	) {
		setupSwagger(app);
	}

	const port = configService.get<number>('app.port', 3000);

	await app.listen(port);
	console.info('Bootstrap', `Server running on 🚀 http://localhost:${port}`);
}

(async () => await bootstrap())();
