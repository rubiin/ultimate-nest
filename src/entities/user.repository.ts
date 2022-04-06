import { EntityRepository } from "@mikro-orm/postgresql";
import { User } from "./user.entity";

export class UserRepository extends EntityRepository<User> {}
