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
		// Check if the connection already exists
		const socketConnectionExists = this.findByUserId(connection.connectedUser.id);

		// If the connection does not exist, create it
		if (socketConnectionExists) {
			const socketConnection = this.socketConnectionRepository.create(connection);

			await this.socketConnectionRepository.persistAndFlush(socketConnection);
		}
	}

	async deleteAllConnection() {
		return this.socketConnectionRepository.nativeDelete({});
	}

	async findByUserId(id: number) {
		return this.socketConnectionRepository.findOne({
			connectedUser: id,
		});
	}

	async findBySocketId(id: string) {
		return this.socketConnectionRepository.findOne({
			socketId: id,
		});
	}

	async deleteBySocketId(id: string) {
		return this.socketConnectionRepository.findAndDelete({
			socketId: id,
		});
	}
}
