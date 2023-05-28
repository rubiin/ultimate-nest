import { Module } from "@nestjs/common";

import { ConfigurableModuleClass } from "./fast-jwt.module-definition";
import { FastJwtService } from "./fast-jwt.service";

@Module({
	providers: [FastJwtService],
	exports: [FastJwtService],
})
export class FastJwtModule extends ConfigurableModuleClass {}
