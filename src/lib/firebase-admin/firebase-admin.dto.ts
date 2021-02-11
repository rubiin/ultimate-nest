import { IsNotEmpty, IsString } from 'class-validator';

export class FirebaseAdminConfig {
	@IsNotEmpty()
	@IsString()
	FIREBASE_DATABASE_URL!: string;

	@IsNotEmpty()
	@IsString()
	FIREBASE_CREDENTIAL_PATH!: string;
}
