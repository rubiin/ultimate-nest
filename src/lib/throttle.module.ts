import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";

@Module({
  exports: [ThrottlerModule],
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configs, true>) => ({
        ignoreUserAgents: [/nestify/i],
        limit: configService.get("throttle.limit", { infer: true }),
        throttlers: [],
        ttl: configService.get("throttle.ttl", { infer: true }),
      }),
    }),
  ],
})
export class NestThrottlerModule {}
