import { Module } from "@nestjs/common";

import { ConfigurableModuleClass } from "./cloudinary.module-definition";
import { CloudinaryService } from "./cloudinary.service";

@Module({
	providers: [CloudinaryService],
	exports: [CloudinaryService],
})
export class CloudinaryModule extends ConfigurableModuleClass {}
