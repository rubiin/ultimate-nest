import { INestApplicationContext } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { Server, ServerOptions } from "socket.io";

export class SocketIOAdapter extends IoAdapter {
	private adapterConstructor: any;

	constructor(
		app: INestApplicationContext,
		private readonly config: ConfigService<IConfig, true>,
	) {
		super(app);
	}

	async connectToRedis(): Promise<void> {
		const pubClient = createClient({ url: this.config.get("redis.url", { infer: true }) });
		const subClient = pubClient.duplicate();

		await Promise.all([pubClient.connect(), subClient.connect()]);

		this.adapterConstructor = createAdapter(pubClient, subClient);
	}

	createIOServer(port: number, options?: ServerOptions): any {
		const cors = {
			origin: ["*"],
		};

		const optionsWithCORS: ServerOptions = {
			...options,
			cors,
		};

		const server: Server = super.createIOServer(port, optionsWithCORS);

		server.adapter(this.adapterConstructor);

		return server;
	}
}
