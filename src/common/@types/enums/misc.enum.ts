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
  ETA = "ETA",
  PUG = "PUG",
  HBS = "HBS",
}

export const FileType: Record<keyof typeof FileSize, RegExp> = {
  IMAGE: /(jpg|jpeg|png|gif|svg)$/i,
  DOC: /(pdf|doc|txt|key|csv|docx|xls|xlsx|ppt|pptx)$/i,
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

export enum RoutingKey {
  SEND_MAIL = "send-mail",
  SEND_NEWSLETTER = "send-newsletter",
}

export enum Queues {
  MAIL = "mail",
  HTTP = "http",
}

export enum PaginationType {
  OFFSET = "OFFSET",
  CURSOR = "CURSOR",
}
