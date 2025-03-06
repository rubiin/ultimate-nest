import  { EntityName, EventArgs, EventSubscriber } from "@mikro-orm/postgresql"
import { HelperService } from "@common/helpers"
import { User } from "@entities"
import { Injectable } from "@nestjs/common"

/* It's a class that implements the EventSubscriber interface, and it's responsible for hashing the
password before the user is created or updated */

@Injectable()
export class UserSubscriber implements EventSubscriber<User> {
  getSubscribedEntities(): EntityName<User>[] {
    return [User]
  }

  async beforeCreate(eventArguments: EventArgs<User>): Promise<void> {
    if (eventArguments.changeSet?.payload?.password != null)
      eventArguments.entity.password = await HelperService.hashString(eventArguments.entity.password)
  }

  async beforeUpdate(eventArguments: EventArgs<User>): Promise<void> {
    if (eventArguments?.changeSet?.payload?.password != null)
      eventArguments.entity.password = await HelperService.hashString(eventArguments.entity.password)
  }
}
