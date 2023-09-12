// regex constants
export const JWT_EXPIRY_REGEX = /\b(\d+)\s*(ms|s|m|h|d)\b/;
export const SENTRY_DSN_REGEX = /https:\/\/[\da-f]{32}@o\d+\.ingest\.sentry\.io\/\d+/;
export const RABBIT_MQ_URI_REGEX
    = /^(amqps?):\/\/(?:[^:@]+:[^:@]+@)?[^/:?]+(?::\d+)?(?:\/[^/?]+)?(?:\?.*)?$/;
export const REDIS_URI_REGEX = /^redis:\/\/(?:([^:@]+):([^:@]+)@)?([^/:]+)(?::(\d+))?(?:\/(\d+))?$/;
export const USERNAME_REGEX = /^(?![\d._-])[\w-.]+$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).*$/;
