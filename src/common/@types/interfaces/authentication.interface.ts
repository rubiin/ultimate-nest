export interface IAuthenticationResponse {
	user: {
		idx: string;
	};
	accessToken: string;
	refreshToken?: string;
}

export interface IOauthResponse {
	email: string;
	firstName?: string;
	lastName?: string;
	accessToken: string;
}

export interface IJwtPayload {
	jti?: number;
	sub: number;
	iat: number;
	exp: number;
	aud: string;
	iss: string;
	isTwoFactorEnabled?: boolean;
	roles?: string[];
}
