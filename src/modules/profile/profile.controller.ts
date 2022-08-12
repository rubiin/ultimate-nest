import { LoggedInUser } from "@common/decorators/user.decorator";
import { JwtAuthGuard } from "@common/guards/jwt.guard";
import { IProfileData } from "@common/interfaces/followers.interface";
import { User } from "@entities";
import {
	CacheInterceptor,
	Controller,
	Delete,
	Get,
	HttpStatus,
	Param,
	Post,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AccessGuard } from "nest-casl";
import { Observable } from "rxjs";
import { ProfileService } from "./profile.service";

@ApiTags("Profile")
@UseGuards(JwtAuthGuard, AccessGuard)
@UseInterceptors(CacheInterceptor)
@Controller("profile")
export class ProfileController {
	constructor(private readonly profileService: ProfileService) {}

	@ApiOperation({ summary: "Profile fetch" })
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: "Profile does not exist.",
	})
	@Get()
	profile(@LoggedInUser("email") email: string): Observable<User> {
		return this.profileService.profile(email);
	}

	@ApiOperation({ summary: "Profile follow" })
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: "Profile does not exist.",
	})
	@Post(":username/follow")
	follow(
		@LoggedInUser("email") email: string,
		@Param("username") username: string,
	): Observable<IProfileData> {
		return this.profileService.follow(email, username);
	}

	@ApiOperation({ summary: "Profile unfollow" })
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: "Profile does not exist.",
	})
	@Delete(":username/follow")
	unFollow(
		@LoggedInUser("id") userId: string,
		@Param("username") username: string,
	): Observable<IProfileData> {
		return this.profileService.unFollow(userId, username);
	}
}
