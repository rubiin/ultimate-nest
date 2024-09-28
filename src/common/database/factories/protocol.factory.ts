import { Protocol } from "@entities"
import { Factory } from "@mikro-orm/seeder"

/* `ProtocolFactory` is a factory that creates `Protocol` instances */
export class ProtocolFactory extends Factory<Protocol> {
  model = Protocol

  definition(): Partial<Protocol> {
    return {
      loginAttemptnumbererval: 10,
      loginnumberervalUnit: "m",
      loginMaxRetry: 10,
      otpExpiryInMinutes: 5,
    }
  }
}
