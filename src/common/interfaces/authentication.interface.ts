import {AppRoles} from "@common/constants/app.roles";

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
    role: AppRoles;
    iat?: Date;
}

export interface IGoogleResponse {
    email: string;
    firstName: string;
    lastName: string;
    avatar: string;
    accessToken: string;
}
