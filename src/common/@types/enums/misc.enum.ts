import { TEmailSubject } from "../interfaces";

export const BYTE_TO_MB = 1024 * 1024;

export enum EmailTemplate {
  RESET_PASSWORD_TEMPLATE = "reset",
  WELCOME_TEMPLATE = "welcome",
  MAGIC_LOGIN_TEMPLATE = "magiclogin",
  NEWSLETTER_TEMPLATE = "newsletter",
}

export const EmailSubject: Record<TEmailSubject, string> = {
  MAGIC_LOGIN: "Login to the app",
  NEWSLETTER: "Newsletter",
  RESET_PASSWORD: "Reset your password",
  WELCOME: "Welcome to the app",
};

export const FileSize = {
  DOC: 10 * BYTE_TO_MB, // 10MB
  IMAGE: 5 * BYTE_TO_MB, // 5MB
};

export enum PostStateEnum {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
}

export enum Server {
  SES = "SES",
  SMTP = "SMTP",
}

export enum TemplateEngine {
  ETA = "eta",
  PUG = "pug",
  HANDLEBARS = "handlebars",
}

export const FileType: Record<keyof typeof FileSize, string[]> = {
  DOC: ["pdf", "doc", "txt", "key", "csv", "docx", "xls", "xlsx", "ppt", "pptx"],
  IMAGE: ["jpg", "jpeg", "png", "svg", "webp", "gif", "svg"],
};

export const ThreadFunctions = {
  HASH_STRING: "hashString",
};

export const RoutingKey = {
  SEND_MAIL: "send-mail",
  SEND_NEWSLETTER: "send-newsletter",
};

export const Queues = {
  HTTP: "http",
  MAIL: "mail",
};

// database enums

export enum QueryOrder {
  ASC = "ASC",
  DESC = "DESC",
}

export enum ReferralStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
}

export enum PaginationType {
  OFFSET = "OFFSET",
  CURSOR = "CURSOR",
}

export enum AuditAction {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
}
