import { Module, RequestMethod } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";

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
							req(request) {
								request.body = request.raw.body;

								return request;
							},
						},
						level: process.env.NODE_ENV.startsWith("prod") ? "info" : "debug",
						redact: {
							paths: ["req.headers.authorization"],
						},
						transport: process.env.NODE_ENV.startsWith("prod")
							? undefined
							: {
									target: "pino-pretty",
									options: {
										colorize: true,
										translateTime: true,
										ignore: "pid,hostname",
										singleLine: true,
									},
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
