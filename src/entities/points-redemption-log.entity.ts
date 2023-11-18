import type { Ref, Rel } from "@mikro-orm/core";
import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "@common/database";
import type { User } from "./user.entity";

@Entity()
export class PointRedemptionLog extends BaseEntity {
  @Property()
    points!: number;

  @Property({ columnType: "numeric(9,2)" })
    amount!: string;

  @ManyToOne()
    user!: Rel<Ref<User>>;

  constructor(partial?: Partial<PointRedemptionLog>) {
    super();
    Object.assign(this, partial);
  }
}
