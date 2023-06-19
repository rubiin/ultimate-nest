export class AuthenticationResponse {
	user: {
		idx?: string;
	};
	accessToken: string;
	refreshToken?: string;
}
