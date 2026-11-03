import { Global, Module } from "@nestjs/common";

import { CaslAbilityFactory } from "./casl-ability.factory.js";

@Global()
@Module({
  exports: [CaslAbilityFactory],
  providers: [CaslAbilityFactory],
})
export class NestCaslModule {}
