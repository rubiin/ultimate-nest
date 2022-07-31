import {NestConfigModule} from "@lib/config/config.module";
import {Global, Module} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {NestMinioModule} from "nestjs-minio";

@Global()
@Module({
    imports: [
        NestMinioModule.registerAsync({
            imports: [NestConfigModule],
            useFactory: async (configService: ConfigService) => ({
                endPoint: configService.get("minio.host"),
                port: configService.get<number>("minio.port"),
                accessKey: configService.get("minio.accessKey"),
                secretKey: configService.get("minio.secretKey"),
                useSSL: configService.get<boolean>("minio.ssl"),
            }),
            inject: [ConfigService],
        }),
    ],
    exports: [NestMinioModule],
})
export class MinioModule {
}
