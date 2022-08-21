import { Injectable, Logger } from "@nestjs/common";
import { plainToClass } from "@nestjs/class-transformer";
import { validateSync } from "@nestjs/class-validator";

@Injectable()
export class ConfigService {
	private readonly envConfig: Record<string, string>;

	validate<T>(module: string, _className: new () => T): T {
		const config = plainToClass(_className as any, this.envConfig);
		const errors = validateSync(config as any, {
			whitelist: true,
			transform: true,
			forbidNonWhitelisted: false,
		});

		if (errors.length > 0) {
			for (const error of errors)
				Logger.error(
					`${error.constraints[Object.keys(error.constraints)[0]]}`,
					undefined,
					module,
				);
			throw new Error(`${module}: Invalid environment config.`);
		}

		return config as any;
	}
}
