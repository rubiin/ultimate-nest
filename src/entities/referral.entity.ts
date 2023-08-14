import { Entity, Enum, Index, ManyToOne, Property, Rel } from '@mikro-orm/core';
import type { User } from './user.entity';
import { ReferralStatus } from '@common/@types';
import { BaseEntity } from '@common/database';

@Entity()
export class Referral extends BaseEntity {
  @Index()
  @ManyToOne()
referrer: Rel<User>;

  @Index()
  @Property()
mobileNumber: string;

  @Index()
  @Enum(() => ReferralStatus)
status = ReferralStatus.PENDING;
}
