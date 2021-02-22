import { ConfigService } from '@lib/config/config.service';
import * as admin from 'firebase-admin';
import { existsSync } from 'fs';
import path from 'path';
import { FIREBASE_ADMIN_TOKEN } from './firebase-admin.constant';
import { FirebaseAdminConfig } from './firebase-admin.dto';

export const FirebaseAdminProvider = {
	inject: [ConfigService],
	provide: FIREBASE_ADMIN_TOKEN,
	useFactory: (configService: ConfigService) => {
		const config = configService.validate(
			'FirebaseAdminModule',
			FirebaseAdminConfig,
		);

		const filePath = path.resolve('.', config.FIREBASE_CREDENTIAL_PATH);

		if (!existsSync(filePath)) throw new Error(`Unknown file ${filePath}`);

		try {
			return admin.initializeApp({
				credential: admin.credential.cert(filePath),
				databaseURL: config.FIREBASE_DATABASE_URL,
			});
		} catch {
			return admin.app(); // This will prevent error when using HMR
		}
	},
};
