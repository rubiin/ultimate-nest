import { Roles } from "@common/types/enums/permission.enum";

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

export interface IJwtPayload {
	username: string;
	role: Roles;
	iat?: Date;
}

export interface IGoogleResponse {
	email: string;
	firstName: string;
	lastName: string;
	avatar: string;
	accessToken: string;
}
