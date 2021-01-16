import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import config from '@config/index';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as compression from 'compression';
import * as helmet from 'helmet';
import { InternalServerExceptionFilter } from '@common/filter/InternalServer.filter';
import { RequestSanitizerInterceptor } from '@common/interceptor/requestSanitizer.interceptor';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

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

	const options = new DocumentBuilder()
		.setTitle('Employee Api')
		.setDescription(
			'The Employee API description built using swagger OpenApi. You can find out more about Swagger at http://swagger.io',
		)
		.setVersion('1.0')
		.build();
	const document = SwaggerModule.createDocument(app, options);

	SwaggerModule.setup('api', app, document);

	await app.listen(config.port);
	console.info(
		'Bootstrap',
		`Server running on 🚀 http://localhost:${config.port}`,
	);
}

bootstrap();