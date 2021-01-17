import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '@entities/User.entity';
import { ActivityLog } from '@entities/ActivityLog.entity';
import { RefreshToken } from '@entities/RefreshToken.entity';
import { OtpLog } from '@entities/OtpLog.entity';


@Module({
  imports: [
    MikroOrmModule.forRoot(),
    MikroOrmModule.forFeature({
      entities: [User,OtpLog,ActivityLog,RefreshToken],
    }),
  ],
  exports: [MikroOrmModule],
})
export class OrmModule { }