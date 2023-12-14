import type { EntityName, EventArgs, EventSubscriber } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { HelperService } from "@common/helpers";
import { User } from "@entities";

/* It's a class that implements the EventSubscriber interface, and it's responsible for hashing the
password before the user is created or updated */

@Injectable()
export class UserSubscriber implements EventSubscriber<User> {
  getSubscribedEntities(): EntityName<User>[] {
    return [User];
  }

  async beforeCreate(arguments_: EventArgs<User>): Promise<void> {
    if (arguments_.changeSet?.payload?.password)
      arguments_.entity.password = await HelperService.hashString(arguments_.entity.password);
  }

  async beforeUpdate(arguments_: EventArgs<User>): Promise<void> {
    if (arguments_.changeSet?.payload?.password)
      arguments_.entity.password = await HelperService.hashString(arguments_.entity.password);
  }
}
