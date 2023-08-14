import { StripeModule } from '@golevelup/nestjs-stripe';
import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';
import { NestConfigModule } from '@lib/config/config.module';

const logger = new Logger('Stripe');

@Global()
@Module({
  imports: [
    StripeModule.forRootAsync(StripeModule, {
      imports: [NestConfigModule],
      useFactory: (configService: ConfigService<Configs, true>) => ({
        apiKey: configService.get('stripe.apiKey', { infer: true }),
        logger,
        webhookConfig: {
          stripeSecrets: {
            account: configService.get('stripe.account', { infer: true }),
            connect: configService.get('stripe.connect', { infer: true }),
          },
        },
        decorators: [SkipThrottle()],
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [StripeModule],
})
export class NestStripeModule {}
