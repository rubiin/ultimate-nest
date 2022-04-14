import { MikroORM } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import {
	HealthCheckError,
	HealthIndicator,
	HealthIndicatorResult,
} from "@nestjs/terminus";

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
	constructor(private readonly orm: MikroORM) {
		super();
	}

	async isHealthy(key = "Users"): Promise<HealthIndicatorResult> {
		try {
			const users = await this.orm.em.find(
				"User",
				{ isObsolete: false },
				{ limit: 1 },
			);

			return this.getStatus(key, true, { users });
		} catch (error) {
			throw new HealthCheckError("Database check failed", error);
		}
	}
}
