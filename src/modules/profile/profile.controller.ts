import { GenericController, LoggedInUser, SwaggerDecorator } from "@common/decorators";
import { IProfileData } from "@common/types/interfaces/followers.interface";
import { User } from "@entities";
import { Delete, Get, Param, Post } from "@nestjs/common";
import { Observable } from "rxjs";
import { ProfileService } from "./profile.service";

@GenericController("profile")
export class ProfileController {
	constructor(private readonly profileService: ProfileService) {}

	@Get()
	@SwaggerDecorator({
		operation: "Profile fetch",
		notFound: "Profile does not exist.",
	})
	profile(@LoggedInUser("email") email: string): Observable<User> {
		return this.profileService.profile(email);
	}

	@Post(":username/follow")
	@SwaggerDecorator({
		operation: "Profile follow",
		notFound: "Profile does not exist.",
	})
	follow(
		@LoggedInUser("email") email: string,
		@Param("username") username: string,
	): Observable<IProfileData> {
		return this.profileService.follow(email, username);
	}

	@Delete(":username/follow")
	@SwaggerDecorator({
		operation: "Profile unfollow",
		notFound: "Profile does not exist.",
	})
	unFollow(
		@LoggedInUser("id") userId: number,
		@Param("username") username: string,
	): Observable<IProfileData> {
		return this.profileService.unFollow(userId, username);
	}
}
