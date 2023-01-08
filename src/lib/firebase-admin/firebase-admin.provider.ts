import { NestFirebaseService } from "./firebase.service";
import { FIREBASE_ADMIN_TOKEN } from "./firebase-admin.constant";

export const connectionFactory = {
	provide: FIREBASE_ADMIN_TOKEN,
	useFactory: async nestFirebaseService => {
		return nestFirebaseService.getFirebaseAdmin();
	},
	inject: [NestFirebaseService],
};
