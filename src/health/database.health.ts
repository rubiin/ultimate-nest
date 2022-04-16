import { MikroORM } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import {
	HealthCheckError,
	HealthIndicator,
	HealthIndicatorResult,
} from "@nestjs/terminus";

/**
 *
 * This is the health indicator for the database.
 * Tries to run a simple count query on the database.
 *
 */

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
	constructor(private readonly orm: MikroORM) {
		super();
	}

	async isHealthy(key = "Users"): Promise<HealthIndicatorResult> {
		try {
			const users = await this.orm.em.count("User", {
				isObsolete: false,
			});

			return this.getStatus(key, true, { users });
		} catch (error) {
			throw new HealthCheckError("Database check failed", error);
		}
	}
}
