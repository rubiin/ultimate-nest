import { AuthenticationPayload } from './authentication.interface';

export interface IResponse {
	message: string;
}

export type ILoginSignupReponse =
	| { message: any; statusCode: number }
	| { message: string; data: AuthenticationPayload };
