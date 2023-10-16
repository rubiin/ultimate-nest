import { Injectable } from "@nestjs/common";
import type { User } from "@entities";
import { WsException } from "@nestjs/websockets";

interface SocketConnection {
  connectedUser: User
  socketId: string
}

@Injectable()
export class SocketConnectionService {
  private readonly socketConnections = new Map<string, User>();

  getAllOnlineUSers() {
    return [...this.socketConnections.values()];
  }

  saveConnection(connection: SocketConnection) {
    return this.socketConnections.set(connection.socketId, connection.connectedUser);
  }

  findByUserId(id: number) {
    let user;

    for (const value of this.socketConnections.values()) {
      if (value.id === id)
        user = value;
    }

    if (!user)
      throw new WsException("User not found");

    return user;
  }

  findBySocketId(id: string) {
    const socket = this.socketConnections.get(id);
    if (!socket)
      throw new WsException("Socket not found");

    return socket;
  }

  deleteBySocketId(id: string) {
    return this.socketConnections.delete(id);
  }
}
