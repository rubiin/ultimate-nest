import { Module, RequestMethod } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";
import { IncomingMessage } from "node:http";

@Module({
	imports: [
		LoggerModule.forRootAsync({
			useFactory: () => {
				return {
					pinoHttp: {
						name: "ultimate-nest",
						customProps: (_request, _response) => ({
							context: "HTTP",
						}),
						serializers: {
							req(request: IncomingMessage) {
								return {
									method: request.method,
									url: request.url,
								};
							},
						},

						redact: {
							paths: ["req.headers.authorization"],
						},
						transport: process.env.NODE_ENV.startsWith("prod")
							? {
									target: "pino/file",
									level: "error", // log only errors to file
									options: { destination: 'app.log' },
							  }
							: {
									targets: [
										{
											target: "pino-pretty",
											level: "info", // log only info and above to console
											options: {
												colorize: true,
												translateTime: true,
												ignore: "pid,hostname",
												singleLine: true,
											},
										},
										{
											target: "pino/file",
											level: "error", // log only errors to file
											options: { destination: 'app.log' },
										},
									],
							  },
					},
					exclude: [{ method: RequestMethod.ALL, path: "doc" }],
				};
			},
		}),
	],
	exports: [LoggerModule],
})
export class NestPinoModule {}
