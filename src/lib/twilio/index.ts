import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { TwilioModule } from "./twilio.module";

@Module({
  exports: [TwilioModule],
  imports: [
    TwilioModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configs, true>) => ({
        accountSid: configService.get("twilio.accountSid", { infer: true }),
        authToken: configService.get("twilio.authToken", { infer: true }),
        from: configService.get("twilio.from", { infer: true }),
        isGlobal: true,
      }),
    }),
  ],
})
export class NestTwilioModule {}
