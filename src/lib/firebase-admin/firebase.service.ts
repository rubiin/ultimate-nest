import { existsSync } from "node:fs";
import path from "node:path";

import { Inject, Injectable } from "@nestjs/common";
import admin from "firebase-admin";

import { FirebaseModuleOptions, MODULE_OPTIONS_TOKEN } from "./fire-base.module.definition";

interface NestFirebase {
	getFirebaseAdmin(): admin.app.App;
}

@Injectable()
export class NestFirebaseService implements NestFirebase {
	private _firebaseConnection: any;

	constructor(
		@Inject(MODULE_OPTIONS_TOKEN) private _NestFirebaseOptions: FirebaseModuleOptions,
	) {}

	getFirebaseAdmin(): admin.app.App {
		const filePath = path.resolve(".", this._NestFirebaseOptions.FIREBASE_CREDENTIAL_PATH);

		if (!existsSync(filePath)) throw new Error(`Unknown file ${filePath}`);

		if (!this._firebaseConnection) {
			try {
				this._firebaseConnection = admin.initializeApp({
					credential: admin.credential.cert(filePath),
					databaseURL: this._NestFirebaseOptions.FIREBASE_DATABASE_URL,
				});
			} catch {
				this._firebaseConnection = admin.app(); // This will prevent error when using HMR
			}
		}

		return this._firebaseConnection;
	}
}
