import { IProfileData } from "@common/@types";
import { GenericController, LoggedInUser, SwaggerResponse } from "@common/decorators";
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
		notFounds: ["Profile does not exist."],
	})
	profile(@LoggedInUser("username") username: string): Observable<User> {
		return this.profileService.getProfileByUsername(username, ["followers", "followed"]);
	}

	@Post(":username/follow")
	@SwaggerResponse({
		operation: "Profile follow",
		notFounds: ["Profile does not exist."],
		params: ["username"],
	})
	follow(
		@LoggedInUser() user: User,
		@Param("username") username: string,
	): Observable<IProfileData> {
		return this.profileService.follow(user, username);
	}

	@Delete(":username/unfollow")
	@SwaggerResponse({
		operation: "Profile unfollow",
		notFounds: ["Profile does not exist."],
		params: ["username"],
	})
	unFollow(
		@LoggedInUser() user: User,
		@Param("username") username: string,
	): Observable<IProfileData> {
		return this.profileService.unFollow(user, username);
	}
}
