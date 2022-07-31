import {BaseEntity} from "@common/database/base-entity.entity";
import {Entity, ManyToOne, Property} from "@mikro-orm/core";
import {User} from "./user.entity";

@Entity()
export class RefreshToken extends BaseEntity {
    @Property()
    expiresIn!: Date;

    @ManyToOne()
    user: User;

    @Property()
    isRevoked = false;
}
