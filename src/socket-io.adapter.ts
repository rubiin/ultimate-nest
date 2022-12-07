import { INestApplicationContext, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { Server, ServerOptions } from "socket.io";

export class SocketIOAdapter extends IoAdapter {
	private readonly logger = new Logger(SocketIOAdapter.name);
	constructor(private app: INestApplicationContext, private configService: ConfigService) {
		super(app);
	}

	createIOServer(port: number, options?: ServerOptions) {
		const clientPort = 8000;

		const cors = {
			origin: [
				`http://localhost:${clientPort}`,
				new RegExp(`/^http:\/\/192\.168\.1\.([1-9]|[1-9]\d):${clientPort}$/`),
			],
		};

		const optionsWithCORS: ServerOptions = {
			...options,
			cors,
		};

		const server: Server = super.createIOServer(port, optionsWithCORS);

		return server;
	}
}
