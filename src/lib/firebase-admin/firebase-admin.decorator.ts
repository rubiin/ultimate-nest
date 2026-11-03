import { Inject } from "@nestjs/common";

import { FIREBASE_ADMIN_TOKEN } from "./firebase-admin.constant.js";

export const InjectFirebaseAdmin = () => Inject(FIREBASE_ADMIN_TOKEN);
