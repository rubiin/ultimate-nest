import { Global, Module } from '@nestjs/common';

import { FirebaseAdminProvider } from './firebase-admin.provider';

@Global()
@Module({
	providers: [FirebaseAdminProvider],
	exports: [FirebaseAdminProvider],
})
export class FirebaseAdminModule {}
