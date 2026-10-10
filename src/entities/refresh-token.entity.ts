import { BaseEntity } from "@common/database";
import { Entity, ManyToOne, Property } from "@mikro-orm/decorators/legacy";
import type { Rel } from "@mikro-orm/postgresql";
import { Opt, Ref } from "@mikro-orm/postgresql";

import { User } from "./user.entity";

@Entity()
export class RefreshToken extends BaseEntity {
  @Property()
  expiresIn!: Date;

  @ManyToOne({
    index: true,
  })
  user!: Rel<Ref<User>>;

  @Property({ length: 45, nullable: true })
  ipAddress?: string;

  @Property({ length: 512, nullable: true })
  userAgent?: string;

  @Property({ index: true })
  isRevoked: boolean & Opt = false;

  constructor(partial?: Partial<RefreshToken>) {
    super();
    Object.assign(this, partial);
  }
}
