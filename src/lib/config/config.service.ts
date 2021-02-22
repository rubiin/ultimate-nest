import { Injectable, Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

@Injectable()
export class ConfigService {
	private readonly envConfig: Record<string, string>;

	validate<T>(module: string, className: new () => T): T {
		const config = plainToClass(className as any, this.envConfig);
		const errors = validateSync(config as any, {
			whitelist: true,
			transform: true,
			forbidNonWhitelisted: false,
		});

		if (errors.length > 0) {
			for (const e of errors)
				Logger.error(
					`${e.constraints[Object.keys(e.constraints)[0]]}`,
					undefined,
					module,
				);
			throw new Error(`${module}: Invalid environment config.`);
		}

		return config as any;
	}
}
