import type { TEmailSubject } from "../interfaces";

export const BYTE_TO_MB = 1024 * 1024;

export enum EmailTemplate {
  RESET_PASSWORD_TEMPLATE = "reset",
  WELCOME_TEMPLATE = "welcome",
  MAGIC_LOGIN_TEMPLATE = "magiclogin",
  NEWSLETTER_TEMPLATE = "newsletter",
}

export const EmailSubject: Record<TEmailSubject, string> = {
  RESET_PASSWORD: "Reset your password",
  WELCOME: "Welcome to the app",
  MAGIC_LOGIN: "Login to the app",
  NEWSLETTER: "Newsletter",
};

export const FileSize = {
  IMAGE: 5 * BYTE_TO_MB, // 5MB
  DOC: 10 * BYTE_TO_MB, // 10MB
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
  IMAGE:["jpg", "jpeg", "png", "svg", "webp", "gif", "svg"],
  DOC:["pdf", "doc", "txt", "key", "csv", "docx", "xls", "xlsx", "ppt", "pptx"],
};

export const ThreadFunctions = {
  HASH_STRING: "hashString",
};

export const RoutingKey = {
  SEND_MAIL: "send-mail",
  SEND_NEWSLETTER: "send-newsletter",
};

export const Queues = {
  MAIL: "mail",
  HTTP: "http",
};

// database enums

export enum CursorType {
  DATE = "DATE",
  STRING = "STRING",
  NUMBER = "NUMBER",
}

export enum QueryCursor {
  DATE = "DATE",
  ALPHA = "ALPHA",
}

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
