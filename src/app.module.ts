import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { AuthorModule } from './modules/author/author.module';

@Module({
	imports: [
		AuthorModule,
		MikroOrmModule.forRoot(),
		GraphQLModule.forRoot({
			installSubscriptionHandlers: true,
			tracing: true,
			autoSchemaFile: 'schema.gql',
		}),
	],
})
export class AppModule {}
