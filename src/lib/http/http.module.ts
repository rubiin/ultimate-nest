import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";

@Module({
	imports: [
		HttpModule.register({
			timeout: 5000,
			maxRedirects: 5,
			withCredentials: false,
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				"user-agent": `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.55 Safari/537.36`,
			},
		}),
	],
	exports: [HttpModule],
})
export class NestHttpModule {}
