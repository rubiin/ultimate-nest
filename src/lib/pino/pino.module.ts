import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

@Module({
	exports: [LoggerModule],
	imports: [
		LoggerModule.forRootAsync({
			useFactory: () => {
				return {
					pinoHttp:
						process.env.NODE_ENV !== 'production'
							? {
									prettyPrint: {
										colorize: true,
										levelFirst: true,
										translateTime: 'yyyy-mm-dd HH:MM:ss',
									},
							  }
							: {},
				};
			},
		}),
	],
})
export class NestPinoModule {}
