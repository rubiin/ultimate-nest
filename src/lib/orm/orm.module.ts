import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '@entities/User.entity';
import { ActivityLog } from '@entities/ActivityLog.entity';
import { RefreshToken } from '@entities/RefreshToken.entity';
import { OtpLog } from '@entities/OtpLog.entity';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
			entities: [User, OtpLog, ActivityLog, RefreshToken],
		}),
	],
	exports: [MikroOrmModule],
})
export class OrmModule {}
