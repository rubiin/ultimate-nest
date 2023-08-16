import type admin from "firebase-admin";
import { NestFirebaseService } from "./firebase.service";
import { FIREBASE_ADMIN_TOKEN } from "./firebase-admin.constant";

export const connectionFactory = {
  provide: FIREBASE_ADMIN_TOKEN,
  useFactory: async (nestFirebaseService: { getFirebaseAdmin: () => admin.app.App }) => {
    return nestFirebaseService.getFirebaseAdmin();
  },
  inject: [NestFirebaseService],
};
