export interface IAuthenticationPayload {
	user: {
		id: number;
		idx: string;
	};
	payload: {
		access_token: string;
		refresh_token?: string;
	};
}

export interface IOauthResponse {
	email: string;
	firstName: string;
	lastName: string;
	accessToken: string;
}

export interface RefreshTokenPayload {
	jti: number;
	sub: number;
}
