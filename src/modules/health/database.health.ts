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

	/**
	 * It checks if the database is healthy by counting the number of users in the database
	 * @param [key=Users] - The name of the health check.
	 * @returns A HealthIndicatorResult object.
	 */
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
