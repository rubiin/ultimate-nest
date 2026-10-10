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

@GenericController("profile")
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApplyCustomCache()
  @Get()
  @SwaggerResponse({
    notFound: "Profile does not exist.",
    operation: "Profile fetch",
  })
  profile(@LoggedInUser("username") username: string): Observable<User> {
    return this.profileService.getProfileByUsername(username, ["followers", "followed"]);
  }

  @Post(":username/follow")
  @SwaggerResponse({
    notFound: "Profile does not exist.",
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
    notFound: "Profile does not exist.",
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
