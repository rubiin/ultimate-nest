import { IsNotEmpty, IsString } from "@nestjs/class-validator";

export class FirebaseAdminConfig {
	@IsNotEmpty()
	@IsString()
	FIREBASE_DATABASE_URL!: string;

	@IsNotEmpty()
	@IsString()
	FIREBASE_CREDENTIAL_PATH!: string;
}
