import admin from "firebase-admin";

import { FIREBASE_ADMIN_TOKEN } from "./firebase-admin.constant";
import { NestFirebaseService } from "./firebase.service";

export const connectionFactory = {
  provide: FIREBASE_ADMIN_TOKEN,
  useFactory: async (nestFirebaseService: { getFirebaseAdmin: () => admin.app.App }) => {
    return nestFirebaseService.getFirebaseAdmin();
  },
  inject: [NestFirebaseService],
};
