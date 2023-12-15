import type { INestApplicationContext } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import type { Adapter } from "socket.io-adapter";
import type { Namespace, Server, ServerOptions } from "socket.io";

export class SocketIOAdapter extends IoAdapter {
  private adapterConstructor!: ((nsp: Namespace) => Adapter);

  constructor(
    app: INestApplicationContext,
    private readonly configService: ConfigService<Configs, true>,
  ) {
    super(app);
  }

  /**
   * The function connects to a Redis server and creates a Redis adapter.
   * @returns a promise that resolves to void.
   */
  async connectToRedis(): Promise<void> {
    const pubClient = createClient({
      url: this.configService.get("redis.url", { infer: true }),
    });
    const subClient = pubClient.duplicate();

    await Promise.allSettled([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  /**
   * The function creates an IO server with CORS options and an adapter constructor.
   * @param port - The `port` parameter is the port number on which the server will listen for
   * incoming connections. It is a number that specifies the port, such as 3000 or 8080.
   * @param [options] - The `options` parameter is an optional object that can contain
   * additional configuration options for the server. It is of type `ServerOptions`.
   * @returns a server object.
   */
  createIOServer(port: number, options?: ServerOptions) {
    const cors = {
      origin: this.configService.get("app.allowedOrigins", { infer: true }),
    };

    const optionsWithCORS = {
      ...options,
      cors,
    };

    const server = super.createIOServer(port, optionsWithCORS) as Server;

    server.adapter(this.adapterConstructor);

    return server;
  }
}
