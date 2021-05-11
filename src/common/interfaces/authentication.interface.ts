export interface IAuthenticationPayload {
	user: any;
	payload: {
		access_token: string;
		refresh_token?: string;
	};
}
