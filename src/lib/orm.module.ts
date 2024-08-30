import { MikroOrmModule } from "@mikro-orm/nestjs";
import { defineConfig } from "@mikro-orm/postgresql";
import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { baseOptions } from "@common/database/orm.config";

@Global()
@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configs, true>) =>
        defineConfig({
          ...baseOptions,
          ...configService.getOrThrow("database", { infer: true })
        }),
    }),
    MikroOrmModule.forFeature({
      entities: baseOptions.entities,
    }),
  ],
  exports: [MikroOrmModule],
})
export class OrmModule {}
