import { ProfileData } from "@common/@types";
import {
  ApplyCustomCache,
  GenericController,
  LoggedInUser,
  SwaggerResponse,
} from "@common/decorators";
import { User } from "@entities";
import { Delete, Get, Param, Post } from "@nestjs/common";
import { Observable } from "rxjs";

import { ProfileService } from "./profile.service";

const PROFILE_NOT_FOUND = "Profile does not exist.";

@GenericController("profile")
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApplyCustomCache()
  @Get()
  @SwaggerResponse({
    notFound: PROFILE_NOT_FOUND,
    operation: "Profile fetch",
  })
  profile(@LoggedInUser("username") username: string): Observable<User> {
    return this.profileService.getProfileByUsername(username, ["followers", "followed"]);
  }

  @Post(":username/follow")
  @SwaggerResponse({
    notFound: PROFILE_NOT_FOUND,
    operation: "Profile follow",
    params: ["username"],
  })
  follow(
    @LoggedInUser() user: User,
    @Param("username")
    username: string,
  ): Observable<ProfileData> {
    return this.profileService.follow(user, username);
  }

  @Delete(":username/unfollow")
  @SwaggerResponse({
    notFound: PROFILE_NOT_FOUND,
    operation: "Profile unfollow",
    params: ["username"],
  })
  unFollow(
    @LoggedInUser() user: User,
    @Param("username")
    username: string,
  ): Observable<ProfileData> {
    return this.profileService.unFollow(user, username);
  }
}
