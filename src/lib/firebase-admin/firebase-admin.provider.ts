import { App } from "firebase-admin";

import { FIREBASE_ADMIN_TOKEN } from "./firebase-admin.constant.js";
import { NestFirebaseService } from "./firebase.service.js";

export const connectionFactory = {
  inject: [NestFirebaseService],
  provide: FIREBASE_ADMIN_TOKEN,
  useFactory: async (nestFirebaseService: { getFirebaseAdmin: () => App }) => {
    return nestFirebaseService.getFirebaseAdmin();
  },
};
