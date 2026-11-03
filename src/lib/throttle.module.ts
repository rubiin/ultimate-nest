import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";

@Module({
  exports: [ThrottlerModule],
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configs, true>) => {
        const limit = Number(configService.get("throttle.limit", { infer: true }));
        const ttl = Number(configService.get("throttle.ttl", { infer: true }));

        return {
          ignoreUserAgents: [],
          throttlers: [{ limit, name: "default", ttl }],
        };
      },
    }),
  ],
})
export class NestThrottlerModule {}
