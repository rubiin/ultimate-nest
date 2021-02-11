import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';
import * as helmet from 'helmet';
import { InternalServerExceptionFilter } from '@common/filter/InternalServer.filter';
import { RequestSanitizerInterceptor } from '@common/interceptor/requestSanitizer.interceptor';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import * as bodyParser from 'body-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as rateLimit from 'express-rate-limit';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	// ==================================================
	// configureExpressSettings
	// ==================================================

	app.set('etag', 'strong')
		.set('trust proxy', true)
		.use(bodyParser.json({ limit: '50mb' }))
		.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
		.use(helmet())
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
			validationError: { target: false },
		}),
	)
		.useGlobalFilters(new InternalServerExceptionFilter())
		.useGlobalInterceptors(new RequestSanitizerInterceptor())
		.setGlobalPrefix('v1')
		.enableCors();

	app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

	// ==================================================
	// configureNestSwagger
	// ==================================================

	const configService = app.get(ConfigService);

	const options = new DocumentBuilder()
		.setTitle('Api')
		.setDescription(
			'The API description built using swagger OpenApi. You can find out more about Swagger at http://swagger.io',
		)
		.setVersion('1.0')
		.build();

	const document = SwaggerModule.createDocument(app, options);

	SwaggerModule.setup('api', app, document);

	const port = configService.get<number>('app.port', 3000);

	await app.listen(port);
	console.info('Bootstrap', `Server running on 🚀 http://localhost:${port}`);
}

bootstrap();
