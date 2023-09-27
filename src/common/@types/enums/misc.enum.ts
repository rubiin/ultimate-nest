import type { TEmailSubject } from "../interfaces";

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
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOC: 10 * 1024 * 1024, // 10MB
};

export enum PostStateEnum {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
}

export const enum Server {
  SES = "SES",
  SMTP = "SMTP",
}

export const enum TemplateEngine {
  ETA = "ETA",
  PUG = "PUG",
  HBS = "HBS",
}

export const FileType: Record<keyof typeof FileSize, RegExp> = {
  IMAGE: /(jpg|jpeg|png|gif|svg)$/i,
  DOC: /(pdf|doc|txt|key|csv|docx|xls|xlsx|ppt|pptx)$/i,
};

// database enums

export const enum CursorType {
  DATE = "DATE",
  STRING = "STRING",
  NUMBER = "NUMBER",
}

export const enum QueryCursor {
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

export const enum RoutingKey {
  SEND_MAIL = "send-mail",
  SEND_NEWSLETTER = "send-newsletter",
}

export const enum PaginationType {
  OFFSET = "OFFSET",
  CURSOR = "CURSOR",
}
