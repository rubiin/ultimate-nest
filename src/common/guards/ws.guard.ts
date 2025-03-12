import  { JwtPayload } from "@common/@types"
import  { BaseRepository } from "@common/database"
import  { CanActivate, ExecutionContext } from "@nestjs/common"
import  { JwtService } from "@nestjs/jwt"
import  { Socket } from "socket.io"
import { User } from "@entities"
import { translate } from "@lib/i18n"
import { InjectRepository } from "@mikro-orm/nestjs"
import { Injectable } from "@nestjs/common"
import { WsException } from "@nestjs/websockets"

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: BaseRepository<User>,
  ) { }

  async canActivate(context: ExecutionContext) {
    const client = context.switchToWs().getClient<Socket>()?.handshake

    if (client.headers.authorization === null || client.headers.authorization === undefined)
      throw new WsException(translate("exception.apiUnauthorizedResponse"))
    const token = client.headers.authorization

    const payload: JwtPayload = await this.jwtService.verify(token)
    const user = await this.userRepository.findOne({ id: payload.sub })

    if (!user)
      throw new WsException(translate("exception.apiUnauthorizedResponse"))

    return true
  }
}
