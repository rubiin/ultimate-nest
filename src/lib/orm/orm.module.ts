import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '@entities/user.entity';
import { ActivityLog } from '@entities/activity-log.entity';
import { RefreshToken } from '@entities/refresh-token.entity';
import { OtpLog } from '@entities/otp-log.entity';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Entities from '@entities/index';
@Module({
	imports: [
		MikroOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: 'postgresql',
				host: configService.get('database.host'),
				port: configService.get<number>('database.port'),
				password: configService.get('database.password'),
				user: configService.get('database.username'),
				dbName: configService.get('database.dbName'),
				entities: ['dist/**/*.entity.js'],
				entitiesTs: ['src/**/*.entity.ts'],
				debug: true,
				highlighter: new SqlHighlighter(),
				metadataProvider: TsMorphMetadataProvider,
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
