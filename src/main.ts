import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';
import * as helmet from 'helmet';
import { RequestSanitizerInterceptor } from '@common/interceptor/requestSanitizer.interceptor';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import * as bodyParser from 'body-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as rateLimit from 'express-rate-limit';
import setupSwagger from 'swagger';
import * as csurf from 'csurf';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		cors: true,
	});

	const configService = app.get(ConfigService);

	// ==================================================
	// configureExpressSettings
	// ==================================================

	app.set('etag', 'strong')
		.set('trust proxy', true)
		.use(bodyParser.json({ limit: '50mb' }))
		.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
		.use(helmet())
		.use(csurf())
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

bootstrap();
