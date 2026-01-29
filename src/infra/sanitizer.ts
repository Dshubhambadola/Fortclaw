/**
 * Utility to sanitize sensitive information from logs and audit trails.
 */

const SECRET_PATTERNS = [
  // Generic Bearer tokens
  /Bearer\s+[a-zA-Z0-9\-\._~\+\/]+=*/gi,
  // OpenAI Keys
  /sk-[a-zA-Z0-9]{20,}T3BlbkFJ/g, // Specific header sometimes seen
  /sk-[a-zA-Z0-9]{32,}/g,
  // AWS Access Key ID
  /AKIA[0-9A-Z]{16}/g,
  // Slack Tokens
  /xox[bpa]-[a-zA-Z0-9-]+/g,
  // Private Keys
  /-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/g,
  /-----BEGIN RSA PRIVATE KEY-----[\s\S]*?-----END RSA PRIVATE KEY-----/g,
  // Github Tokens
  /gh[pousr]_[a-zA-Z0-9]{36}/g,
];

const SECRET_KEYS = new Set([
  "password",
  "secret",
  "token",
  "apikey",
  "api_key",
  "access_key",
  "authorization",
  "auth",
  "client_secret",
]);

const REDACTED = "[REDACTED]";

export class Sanitizer {
  static sanitize(value: unknown): unknown {
    if (typeof value === "string") {
      return Sanitizer.sanitizeString(value);
    }
    if (typeof value === "object" && value !== null) {
      if (Array.isArray(value)) {
        return value.map((item) => Sanitizer.sanitize(item));
      }
      // Handle plain objects
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        if (Sanitizer.isSecretKey(key)) {
          sanitized[key] = REDACTED;
        } else {
          sanitized[key] = Sanitizer.sanitize(val);
        }
      }
      return sanitized;
    }
    return value;
  }

  static sanitizeString(str: string): string {
    let result = str;
    for (const pattern of SECRET_PATTERNS) {
      result = result.replace(pattern, REDACTED);
    }
    return result;
  }

  private static isSecretKey(key: string): boolean {
    const lower = key.toLowerCase().replace(/[-_]/g, "");
    // Check strict match or containment for some keywords
    return SECRET_KEYS.has(lower) || lower.includes("password") || lower.includes("secret");
  }
}
