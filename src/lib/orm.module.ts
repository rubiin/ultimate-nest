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
          host: configService.get("database.host", { infer: true }),
          port: configService.get("database.port", { infer: true }),
          dbName: configService.get("database.dbName", { infer: true }),
          user: configService.get("database.user", { infer: true }),
          password: configService.get("database.password", { infer: true }),
        }),
    }),
    MikroOrmModule.forFeature({
      entities: baseOptions.entities,
    }),
  ],
  exports: [MikroOrmModule],
})
export class OrmModule {}
