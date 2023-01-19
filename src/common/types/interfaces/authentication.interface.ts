export interface IAuthenticationPayload {
	user: {
		idx: string;
	};
	access_token: string;
	refresh_token?: string;
}

export interface IOauthResponse {
	email: string;
	firstName: string;
	lastName: string;
	accessToken: string;
}

export interface IJwtPayload {
	isTwoFactorEnabled?: boolean;
	roles?: string[];
	jti?: number;
	sub: number;
	iat: number;
	exp: number;
	aud: string;
	iss: string;
}
