import type { TemplateEngine } from "@common/@types"
import type { SupportedTemplateEngines } from "@ladjs/consolidate"
import consolidate from "@ladjs/consolidate"
import { Logger } from "@nestjs/common"

export interface Adapter {
  logger: Logger
  compile: (template: string, data: Record<string, any>) => Promise<string>
}

export class BaseAdapter implements Adapter {
  logger: Logger = new Logger(BaseAdapter.name)
  constructor(private engine: TemplateEngine) {}

  async compile(template: string, data: Record<string, any>): Promise<string> {
    return consolidate[this.engine as SupportedTemplateEngines](template, data)
  }
}
