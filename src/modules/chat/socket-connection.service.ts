import { Injectable } from '@nestjs/common';
import type { User } from '@entities';

interface SocketConnection {
  connectedUser: User;
  socketId: string;
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
    let user: User;

    for (const value of this.socketConnections.values()) {
      if (value.id === id)
        user = value;
    }

    return user;
  }

  findBySocketId(id: string) {
    return this.socketConnections.get(id);
  }

  deleteBySocketId(id: string) {
    return this.socketConnections.delete(id);
  }
}
