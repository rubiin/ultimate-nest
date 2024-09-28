import { ConsoleLogger } from "@nestjs/common"

/**
 * A custom logger that disables all logs emitted by calling `log` method if
 * they use one of the following contexts:
 * - `InstanceLoader`
 * - `RoutesResolver`
 * - `RouterExplorer`
 * - `NestFactory`
 */
export class InternalDisabledLogger extends ConsoleLogger {
  static contextsToIgnore = [
    "InstanceLoader",
    "RoutesResolver",
    "RouterExplorer",
    "NestFactory",
  ]

  log(message: any, context?: string): void {
    if ((context != null) && !InternalDisabledLogger.contextsToIgnore.includes(context)) {
      super.log(message, context)
    }
  }
}
