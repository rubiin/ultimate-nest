import { User } from "@entities";
import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";

interface SocketConnection {
  connectedUser: User;
  socketId: string;
}

@Injectable()
export class SocketConnectionService implements OnModuleDestroy {
  private readonly socketConnections = new Map<string, User>();

  getAllOnlineUSers() {
    return [...this.socketConnections.values()];
  }

  saveConnection(connection: SocketConnection) {
    return this.socketConnections.set(connection.socketId, connection.connectedUser);
  }

  // The scan had no `break`, so it returned the *last* match: a user with several tabs
  // resolved to whichever socket connected most recently.
  findByUserId(id: number) {
    for (const user of this.socketConnections.values()) {
      if (user.id === id) return user;
    }

    throw new WsException("User not found");
  }

  findBySocketId(id: string) {
    const socket = this.socketConnections.get(id);
    if (!socket) throw new WsException("Socket not found");

    return socket;
  }

  deleteBySocketId(id: string) {
    return this.socketConnections.delete(id);
  }

  onModuleDestroy() {
    this.socketConnections.clear();
  }
}
