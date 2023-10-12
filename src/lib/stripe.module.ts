import { StripeModule } from "@golevelup/nestjs-stripe";
import { Global, Logger, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SkipThrottle } from "@nestjs/throttler";

const logger = new Logger("Stripe");

@Global()
@Module({
  imports: [
    StripeModule.forRootAsync(StripeModule, {
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configs, true>) => ({
        apiKey: configService.get("stripe.apiKey", { infer: true }),
        logger,
        webhookConfig: {
          stripeSecrets: {
            account: configService.get("stripe.account", { infer: true })!,
            connect: configService.get("stripe.connect", { infer: true }),
          },
        },
        decorators: [SkipThrottle()],
      }),
    }),
  ],
  exports: [StripeModule],
})
export class NestStripeModule {}
