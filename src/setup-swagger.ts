import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
	const options = new DocumentBuilder()
		.setTitle('Api')
		.setVersion('0.0.1')
		.addBearerAuth()
		.setDescription(
			'The API description built using swagger OpenApi. You can find out more about Swagger at http://swagger.io',
		)
		.setVersion('1.0')
		.build();

	const document = SwaggerModule.createDocument(app, options);

	SwaggerModule.setup('documentation', app, document);
}
