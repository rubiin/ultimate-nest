import type { Ref, Rel } from "@mikro-orm/core";
import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "@common/database";
import type { User } from "./user.entity";

@Entity()
export class OtpLog extends BaseEntity {
  @Property()
    expiresIn!: Date;

  @Property({
    length: 20,
    index: true,
  })
    otpCode?: string;

  @ManyToOne({
    eager: false,
    index: true,
  })
    user!: Rel<Ref<User>>;

  @Property()
    isUsed? = false;

  constructor(partial?: Partial<OtpLog>) {
    super();
    Object.assign(this, partial);
  }
}
