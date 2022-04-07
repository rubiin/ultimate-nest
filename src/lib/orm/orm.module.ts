import * as Entities from "@entities";
import { LoadStrategy } from "@mikro-orm/core";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
@Module({
	imports: [
		MikroOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: "postgresql",
				host: configService.get("database.host"),
				port: configService.get<number>("database.port"),
				password: configService.get("database.password"),
				user: configService.get("database.username"),
				dbName: configService.get("database.dbName"),
				entities: ["dist/**/*.entity.js"],
				entitiesTs: ["src/**/*.entity.ts"],
				debug: true,
				loadStrategy: LoadStrategy.JOINED,
				highlighter: new SqlHighlighter(),
				metadataProvider: TsMorphMetadataProvider,
				registerRequestContext: false,
				pool: { min: 2, max: 10 },
				allowGlobalContext: true,
				migrations: {
					path: "dist/migrations",
					pathTs: "src/migrations",
				},
			}),
			inject: [ConfigService],
		}),
		MikroOrmModule.forFeature({
			entities: [...Object.values(Entities)],
		}),
	],
	exports: [MikroOrmModule],
})
export class OrmModule {}
