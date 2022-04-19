import { BaseRepository } from "@common/database/base.repository";
import * as Entities from "@entities";
import { LoadStrategy } from "@mikro-orm/core";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
import { Logger, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

const logger = new Logger("MikroORM");

@Module({
	imports: [
		MikroOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: "postgresql",
				host: configService.get("db.host"),
				port: configService.get<number>("db.port"),
				password: configService.get("db.password"),
				user: configService.get("db.username"),
				dbName: configService.get("db.database"),
				entities: ["dist/**/*.entity.js"],
				entitiesTs: ["src/**/*.entity.ts"],
				debug: true,
				loadStrategy: LoadStrategy.JOINED,
				highlighter: new SqlHighlighter(),
				metadataProvider: TsMorphMetadataProvider,
				entityRepository: BaseRepository,
				registerRequestContext: false,
				pool: { min: 2, max: 10 },
				allowGlobalContext: true,
				logger: logger.log.bind(logger),
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
