// regex constants
export const JWT_EXPIRY_REGEX = /\b(\d+)\s*(ms|[smhd])?\b/
export const RABBIT_MQ_URI_REGEX
    = /^(amqps?):\/\/(?:[^:@]+:[^:@]+@)?[^/:?]+(?::\d+)?(?:\/[^/?]+)?(?:\?.*)?$/
export const REDIS_URI_REGEX = /^redis:\/\/(?:([^:@]+):([^:@]+)@)?([^/:]+)(?::(\d+))?(?:\/(\d+))?$/
export const USERNAME_REGEX = /^(?![\d._-])[\w.-]+$/
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).*$/
