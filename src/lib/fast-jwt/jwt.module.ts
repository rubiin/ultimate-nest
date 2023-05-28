import { DynamicModule, Module, Provider } from '@nestjs/common';
import {
  FastJwtModuleAsyncOptions,
  FastJwtModuleOptions,
  FastJwtOptionsFactory
} from './interfaces/jwt-module-options.interface';
import { FAST_JWT_MODULE_OPTIONS } from './jwt.constants';
import { createJwtProvider } from './jwt.providers';
import { FastJwtService } from './jwt.service';

@Module({
  providers: [FastJwtService],
  exports: [FastJwtService]
})
export class FastJwtModule {
  static register(options: FastJwtModuleOptions): DynamicModule {
    return {
      module: FastJwtModule,
      global: options.global,
      providers: createJwtProvider(options)
    };
  }

  static registerAsync(options: FastJwtModuleAsyncOptions): DynamicModule {
    return {
      module: FastJwtModule,
      global: options.global,
      imports: options.imports || [],
      providers: this.createAsyncProviders(options)
    };
  }

  private static createAsyncProviders(
    options: FastJwtModuleAsyncOptions
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass
      }
    ];
  }

  private static createAsyncOptionsProvider(
    options: FastJwtModuleAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: FAST_JWT_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || []
      };
    }
    return {
      provide: FAST_JWT_MODULE_OPTIONS,
      useFactory: async (optionsFactory: FastJwtOptionsFactory) =>
        await optionsFactory.createJwtOptions(),
      inject: [options.useExisting || options.useClass]
    };
  }
}
