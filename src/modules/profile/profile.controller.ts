import {LoggedInUser} from "@common/decorators/user.decorator";
import {JwtAuthGuard} from "@common/guards/jwt.guard";
import {IProfileData} from "@common/interfaces/followers.interface";
import {User} from "@entities";
import {Controller, Delete, Get, Param, Post, UseGuards,} from "@nestjs/common";
import {Observable} from "rxjs";
import {ProfileService} from "./profile.service";

@UseGuards(JwtAuthGuard)
@Controller("profile")
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {
    }

    @Get()
    profile(@LoggedInUser("email") email: string): Observable<User> {
        return this.profileService.profile(email);
    }

    @Post(":username/follow")
    follow(
        @LoggedInUser("email") email: string,
        @Param("username") username: string,
    ): Observable<IProfileData> {
        return this.profileService.follow(email, username);
    }

    @Delete(":username/follow")
    unFollow(
        @LoggedInUser("id") userId: number,
        @Param("username") username: string,
    ): Observable<IProfileData> {
        return this.profileService.unFollow(userId, username);
    }
}
