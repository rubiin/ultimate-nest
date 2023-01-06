import { INestApplicationContext, Logger } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { Server, ServerOptions } from "socket.io";

export class SocketIOAdapter extends IoAdapter {
	private readonly logger = new Logger(SocketIOAdapter.name);
	constructor(private app: INestApplicationContext) {
		super(app);
	}

	createIOServer(port: number, options?: ServerOptions) {
		const _clientPort = 8000;

		const cors = {
			origin: [`http://localhost:${_clientPort}`],
		};

		const optionsWithCORS: ServerOptions = {
			...options,
			cors,
		};

		const server: Server = super.createIOServer(port, optionsWithCORS);

		return server;
	}
}
