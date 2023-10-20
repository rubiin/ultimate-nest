import type { Server, TemplateEngine } from "@common/@types";

export type engineOptions = Record<string, any>;

export interface MailModuleOptions {

  credentials: | {
    type: Server.SES
    sesKey: string
    sesAccessKey: string
    sesRegion: string
  }
  | {
    type: Server.SMTP
    host: string
    port: number
    password: string
    username: string
  }
  previewEmail: boolean
  retryAttempts?: number

  templateDir: string
  templateEngine: TemplateEngine.ETA | TemplateEngine.PUG | TemplateEngine.HANDLEBARS
}
