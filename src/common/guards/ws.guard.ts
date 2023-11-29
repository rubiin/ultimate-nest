import { InjectRepository } from "@mikro-orm/nestjs";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WsException } from "@nestjs/websockets";
import { User } from "@entities";
import { BaseRepository } from "@common/database";
import type { JwtPayload } from "@common/@types";

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
        @InjectRepository(User)
        private readonly userRepository: BaseRepository<User>,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToWs().getClient().handshake;
    const token: string = request.headers.authorization;

    const payload: JwtPayload = await this.jwtService.verify(token);
    const user = await this.userRepository.findOne({ id: payload.sub });

    if (!user)
      throw new WsException("Unauthorized");

    // Bonus if you need to access your user after the guard
    request.user = user;

    return true;
  }
}
