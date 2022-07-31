import {Entity, Property} from "@mikro-orm/core";
import {BaseEntity} from "@common/database/base-entity.entity";

@Entity()
export class Protocol extends BaseEntity {
    @Property()
    loginAttemptnumbererval!: number;

    @Property()
    loginnumberervalUnit!: string;

    @Property()
    loginMaxRetry!: number;

    @Property()
    otpExpiryInMinutes!: number;

    @Property()
    mpinAttemptInterval!: number;

    @Property()
    mpinIntervalUnit!: string;

    @Property()
    mpinMaxRetry!: number;
}
