import { existsSync } from "node:fs";
import path from "node:path";

import { Inject, Injectable } from "@nestjs/common";


import { FirebaseModuleOptions } from "./fire-base.module.definition";
import {initializeApp, App, cert} from "firebase-admin/app";
import { MODULE_OPTIONS_TOKEN } from "./fire-base.module.definition";

interface NestFirebase {
  getFirebaseAdmin: () => App;
}

@Injectable()
export class NestFirebaseService implements NestFirebase {
  private _firebaseConnection!: App;

  constructor(@Inject(MODULE_OPTIONS_TOKEN) private _NestFirebaseOptions: FirebaseModuleOptions) {}

  getFirebaseAdmin(): App {
    const filePath = path.resolve(".", this._NestFirebaseOptions.credentialPath);

    if (!existsSync(filePath)) throw new Error(`Unknown file ${filePath}`);

    if (this._firebaseConnection === null) {
      try {
        this._firebaseConnection = initializeApp({
          credential: cert(filePath),
          databaseURL: this._NestFirebaseOptions.databaseUrl,
        });
      } catch {
        this._firebaseConnection = initializeApp(); // This will prevent error when using HMR
      }
    }

    return this._firebaseConnection;
  }
}
