import { InjectRepository } from "@mikro-orm/nestjs";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WsException } from "@nestjs/websockets";
import { User } from "@entities";
import { BaseRepository } from "@common/database";
import type { JwtPayload } from "@common/@types";
import type { Socket } from "socket.io";
import { translate } from "@lib/i18n";

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: BaseRepository<User>,
  ) { }

  async canActivate(context: ExecutionContext) {
    const client = context.switchToWs().getClient<Socket>()?.handshake;

    if (!client.headers.authorization)
      throw new WsException(translate("exception.apiUnauthorizedResponse"));
    const token = client.headers.authorization;

    const payload: JwtPayload = await this.jwtService.verify(token);
    const user = await this.userRepository.findOne({ id: payload.sub });

    if (!user)
      throw new WsException(translate("exception.apiUnauthorizedResponse"));

    return true;
  }
}
