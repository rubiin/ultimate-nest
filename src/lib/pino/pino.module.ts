import { Module } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";

@Module({
	exports: [LoggerModule],
	imports: [
		LoggerModule.forRootAsync({
			useFactory: () => {
				return {
					pinoHttp: {
						serializers: {
							req(request) {
								request.body = request.raw.body;

								return request;
							},
						},
						autoLogging: {
							ignore(request) {
								return ["/doc"].includes(request.url);
							},
						},
						redact: {
							paths: ["req.headers.authorization"],
						},
						transport:
							process.env.NODE_ENV !== "production"
								? {
										target: "pino-pretty",
										options: {
											forceColor: true,
										},
								  }
								: undefined,
					},
				};
			},
		}),
	],
})
export class NestPinoModule {}
