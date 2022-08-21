import { createConfigurableDynamicRootModule } from "@golevelup/nestjs-modules";
import { Global, Module } from "@nestjs/common";
import { CLOUDINARY_MODULE_OPTIONS } from "./cloudinary.constant"; // the constant string/symbol/token
import { CloudinaryModuleOptions } from "./cloudinary.options"; // the options to provide to the service
import { CloudinaryService } from "./cloudinary.service"; // the service to be provided to the rest of the server

@Global()
@Module({
	providers: [CloudinaryService],
	exports: [CloudinaryService],
})
export class CloudinaryModule extends createConfigurableDynamicRootModule<
	CloudinaryModule,
	CloudinaryModuleOptions
>(CLOUDINARY_MODULE_OPTIONS) {
	static Deferred = CloudinaryModule.externallyConfigured(CloudinaryModule, 0);
}
