import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import {
	FastifyAdapter,
	NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyRateLimiter from 'fastify-rate-limit';
import helmet from 'fastify-helmet';
import compression from 'fastify-compress';
import setupSwagger from './swagger';
import { AppUtils } from '@common/helpers/app.utils';

async function bootstrap() {
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter(),
	);

	AppUtils.killAppWithGrace(app);

	const configService = app.get(ConfigService);

	// ==================================================
	// configureFastifySettings
	// ==================================================

	app.enableCors();
	app.register(helmet);
	app.register(compression, { encodings: ['gzip', 'deflate'] });
	app.register(fastifyRateLimiter, {
		max: 100,
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
	)
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

	await app.listen(port, '0.0.0.0');
	console.info('Bootstrap', `Server running on 🚀 http://localhost:${port}`);
}

(async () => await bootstrap())();
