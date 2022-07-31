import { RolesBuilder } from "nest-access-control";

export enum AppRoles {
	AUTHOR = "AUTHOR",
	ADMIN = "ADMIN",
	READER = "READER",
}

export enum AppResource {
	USER = "USER",
	POST = "POST",
}

export const roles: RolesBuilder = new RolesBuilder();

roles
	// READER ROLES
	.grant(AppRoles.READER)
	.readAny(AppResource.POST)
	.readAny(AppResource.USER)
	.updateOwn([AppResource.USER])
	.deleteOwn([AppResource.USER])
	// AUTHOR ROLES
	.grant(AppRoles.AUTHOR)
	.extend(AppRoles.READER)
	.updateOwn([AppResource.POST])
	.deleteOwn([AppResource.POST])
	.createOwn([AppResource.POST])
	// ADMIN ROLES
	.grant(AppRoles.ADMIN)
	.extend(AppRoles.AUTHOR)
	.createAny([AppResource.USER])
	.updateAny([AppResource.POST, AppResource.USER])
	.deleteAny([AppResource.POST, AppResource.USER]);
