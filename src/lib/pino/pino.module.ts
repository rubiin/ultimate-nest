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
							}
						},
						autoLogging: {
							ignore(request) {
								return [
									"/doc",
								].includes(request.url);
							},
						},
						redact: {
							paths: ["req.headers.authorization"],
							remove: true,
						},
						colorize: true,
						transport:
						process.env.NODE_ENV !== "production"
							? { target: "pino-pretty" }
							: undefined,
					},
				};
			},
		}),
	],
})
export class NestPinoModule {}
