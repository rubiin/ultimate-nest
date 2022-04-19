import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import configYaml from "./config.yaml";
import validationSchema from "./validate.config";

@Global()
@Module({
	imports: [
		ConfigModule.forRoot({
			load: [configYaml],
			cache: true,
			isGlobal: true,
			validationSchema: validationSchema,
			validationOptions: {
				abortEarly: true,
			},
		}),
	],
	providers: [ConfigService],
	exports: [ConfigService],
})
export class NestConfigModule {}
