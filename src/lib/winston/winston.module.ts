import { WinstonConfig } from '@lib/options/winston.option';
import { Module } from '@nestjs/common';
import { WinstonModule as NestWinstonModule } from 'nest-winston';

@Module({
	exports: [NestWinstonModule],
	imports: [
		NestWinstonModule.forRootAsync({
			useClass: WinstonConfig,
		}),
	],
})
export class WinstonModule {}
