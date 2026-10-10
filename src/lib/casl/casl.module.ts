import { Global, Module } from "@nestjs/common";

import { CaslAbilityFactory } from "./casl-ability.factory";

@Global()
@Module({
  exports: [CaslAbilityFactory],
  providers: [CaslAbilityFactory],
})
export class NestCaslModule {}
