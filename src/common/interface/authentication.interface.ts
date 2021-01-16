export interface AuthenticationPayload {
	user: any;
	payload: {
		access_token: string;
		refresh_token?: string;
	};
}
