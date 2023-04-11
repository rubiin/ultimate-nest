import { BaseRepository } from "@common/database";
import { SocketConnection, User } from "@entities";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";

interface ISocketConnection {
	connectedUser: User;
	socketId: string;
}

@Injectable()
export class SocketConnectionService {
	constructor(
		@InjectRepository(SocketConnection)
		private readonly socketConnectionRepository: BaseRepository<SocketConnection>,
	) {}

	async saveConnection(connection: ISocketConnection) {
		const socketConnection = this.socketConnectionRepository.create(connection);

		await this.socketConnectionRepository.persistAndFlush(socketConnection);
		
return socketConnection;
	}

	async deleteAllConnection() {
		return this.socketConnectionRepository.nativeDelete({});
	}

	async findByUserId(id: number) {
		return this.socketConnectionRepository.findOne({
			connectedUser: id,
		});
	}

	async deleteBySocketId(id: string) {
		return this.socketConnectionRepository.findAndDelete({
			socketId: id,
		});
	}
}
