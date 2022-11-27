import { GenericController, LoggedInUser, SwaggerResponse } from "@common/decorators";
import { IProfileData } from "@common/types/interfaces";
import { User } from "@entities";
import { Delete, Get, Param, Post } from "@nestjs/common";
import { Observable } from "rxjs";

import { ProfileService } from "./profile.service";

@GenericController("profile")
export class ProfileController {
	constructor(private readonly profileService: ProfileService) {}

	@Get()
	@SwaggerResponse({
		operation: "Profile fetch",
		notFound: "Profile does not exist.",
	})
	profile(@LoggedInUser("username") username: string): Observable<User> {
		return this.profileService.getProfileByUsername(username);
	}

	@Post(":username/follow")
	@SwaggerResponse({
		operation: "Profile follow",
		notFound: "Profile does not exist.",
	})
	follow(
		@LoggedInUser() user: User,
		@Param("username") username: string,
	): Observable<IProfileData> {
		return this.profileService.follow(user, username);
	}

	@Delete(":username/follow")
	@SwaggerResponse({
		operation: "Profile unfollow",
		notFound: "Profile does not exist.",
	})
	unFollow(
		@LoggedInUser() user: User,
		@Param("username") username: string,
	): Observable<IProfileData> {
		return this.profileService.unFollow(user, username);
	}
}
