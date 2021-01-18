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
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	// =================================
	// configureNestGlobals
	// =================================

	app.use(helmet())
		.use(compression())
		.useGlobalPipes(
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

	// =================================
	// configureExpressSettings
	// =================================

	app.set('etag', 'strong');
	app.set('trust proxy', true);
	app.set('x-powered-by', false);

	// =================================
	// configureNestSwagger
	// =================================

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
