import { BaseRepository } from "@common/database"
import { baseOptions } from "@common/database/orm.config"
import * as Entities from "@entities"
import { MikroOrmModule } from "@mikro-orm/nestjs"
import { defineConfig } from "@mikro-orm/postgresql"
import { Global, Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"

@Global()
@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configs, true>) =>
        defineConfig({
          ...baseOptions,
          ...configService.getOrThrow("database", { infer: true }),
          entityRepository: BaseRepository,
        }),
    }),
    MikroOrmModule.forFeature({
      entities: Object.values(Entities),
    }),
  ],
  exports: [MikroOrmModule],
})
export class OrmModule {}
