import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import setupSwagger from './swagger';
import { AppUtils } from '@common/helpers/app.utils';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as compression from 'compression';
import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';
import * as bodyParser from 'body-parser';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	AppUtils.killAppWithGrace(app);

	const configService = app.get(ConfigService);

	// ==================================================
	// configureExpressSettings
	// ==================================================

	app.enableCors();
	app.register(helmet);
	app.register(compression, { encodings: ['gzip', 'deflate'] });
	app.register(fastifyRateLimiter, {
		max: 500,
		timeWindow: '1 minute',
	});
	// ==================================================
	// configureNestGlobals
	// ==================================================

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
		}),
	).setGlobalPrefix('v1');

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
