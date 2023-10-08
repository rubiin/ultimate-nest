import type { EtaConfig } from "eta/dist/types/config";
import type { Options as PugOptions } from "pug";
import type { Server, TemplateEngine } from "@common/@types";

export interface MailModuleOptions {
  host?: string
  port?: number
  password?: string
  username?: string
  previewEmail: boolean
  retryAttempts?: number
  server: Server
  sesKey?: string
  sesAccessKey?: string
  sesRegion?: string
  templateDir: string
  templateEngine:
  | {
    adapter: TemplateEngine.ETA
    options: Partial<EtaConfig>
  }
  | {
    adapter: TemplateEngine.PUG
    options: Partial<PugOptions>
  }
  | {
    adapter: TemplateEngine.HBS
    options: Partial<CompileOptions>
  }
}
