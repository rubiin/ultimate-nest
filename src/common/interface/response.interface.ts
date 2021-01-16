import { AuthenticationPayload } from './authentication.interface';

export interface IResponse {
	statusCode: number;
	message: string;
}

export type loginSignupReponse =
	| { message: any; statusCode: number }
	| { message: string; data: AuthenticationPayload };
