import { User } from "@entities";
import { UserService } from "@modules/user/user.service";
import { Injectable } from "@nestjs/common";
import { Request, SubjectBeforeFilterHook } from "nest-casl";
import { lastValueFrom } from "rxjs";

@Injectable()
export class UserHook implements SubjectBeforeFilterHook<User, Request> {
	constructor(readonly userService: UserService) {}

	async run({ params }: Request) {
		return lastValueFrom(this.userService.getOne(params.idx));
	}
}
