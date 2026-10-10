import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LocalDisk, S3Disk, StorageModule } from "@nestjs/storage";

@Module({
  exports: [StorageModule],
  imports: [
    StorageModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService<Configs, true>) => {
        if (config.get("storage.driver", { infer: true }) === "s3") {
          const s3 = {
            region: config.getOrThrow("storage.s3.region", { infer: true }),
            endpoint: config.getOrThrow("storage.s3.endpoint", { infer: true }),
            credentials: {
              accessKeyId: config.getOrThrow("storage.s3.accessKeyId", { infer: true }),
              secretAccessKey: config.getOrThrow("storage.s3.secretAccessKey", {
                infer: true,
              }),
            },
          };

          return {
            default: "private",
            disks: {
              photos: new S3Disk({
                ...s3,
                bucket: config.getOrThrow("storage.s3.publicBucket", { infer: true }),
                publicUrl: config.getOrThrow("storage.s3.publicCdnUrl", { infer: true }),
              }),
              private: new S3Disk({
                ...s3,
                bucket: config.getOrThrow("storage.s3.privateBucket", { infer: true }),
                publicUrl: config.getOrThrow("storage.s3.privateCdnUrl", { infer: true }),
              }),
            },
          };
        }

        const appUrl = config.getOrThrow("app.url", { infer: true });
        const root = config.getOrThrow("storage.root", { infer: true });
        return {
          default: "private",
          disks: {
            // Product photos: public, served by the app in development
            photos: new LocalDisk({ root: `${root}/photos`, publicUrl: `${appUrl}/photos` }),
            // Invoices and uploads in progress: only reachable through signed URLs
            private: new LocalDisk({
              root: `${root}/private`,
              signedUrls: {
                baseUrl: `${appUrl}/files`,
                keys: [config.getOrThrow("storage.signingKey", { infer: true })],
              },
            }),
          },
        };
      },
    }),
  ],
})
export class NestStorageModule {}
