import { Database, Resource } from "@adminjs/mikroorm";
import { AdminModule } from "@adminjs/nestjs";
import { Module } from "@nestjs/common";
import AdminJS from "adminjs";
import { validate } from "class-validator";
import { adminjsConfig } from "./adminJs.config";

Resource.validate = validate;

AdminJS.registerAdapter({ Database, Resource });

@Module({
	imports: [AdminModule.createAdminAsync(adminjsConfig)],
})
export class NestAdminModule {}
