import { Module } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";

@Module({
	exports: [LoggerModule],
	imports: [
		LoggerModule.forRootAsync({
			useFactory: () => {
				return {
					pinoHttp: {
						level: "info",

						redact: {
							paths: ["req.headers.authorization"],
							remove: true,
						},
						// transport: {
						// 	targets: [
						// 		{
						// 			target: "pino/file",
						// 			level: "info",
						// 			options: {
						// 				destination: "logs/info.log",
						// 				mkdir: true,
						// 			},
						// 		},
						// 		{
						// 			target: "pino-pretty",
						// 			level: "info",
						// 			options: {
						// 				colorize: true,
						// 				prettyPrint: false,
						// 				translateTime: true,
						// 				ignore: "pid,hostname",
						// 			},
						// 		},
						// 	],
						// },
					},
				};
			},
		}),
	],
})
export class NestPinoModule {}
