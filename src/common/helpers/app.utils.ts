import { INestApplication } from '@nestjs/common';

export const AppUtils = {
	/**
	 *
	 *
	 * @static
	 * @param {INestApplication} app
	 * @memberof AppUtils
	 */

	killAppWithGrace: (app: INestApplication) => {
		process.on('SIGINT', async () => {
			setTimeout(() => process.exit(1), 5000);
			await app.close();
			process.exit(0);
		});

		// kill -15

		process.on('SIGTERM', async () => {
			setTimeout(() => process.exit(1), 5000);
			await app.close();
			process.exit(0);
		});
	},
};
