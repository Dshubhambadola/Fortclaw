import { SecurityConfig } from "../config/security-profiles.js";

type ValidationResult = {
  allowed: boolean;
  reason?: string;
};

export class NetworkFilter {
  constructor(private config: SecurityConfig["network"]) {}

  /**
   * Validates if a URL is allowed based on the network configuration.
   */
  validate(url: string): ValidationResult {
    // 1. If egress filtering is disabled, allow everything.
    if (!this.config.egressFiltering) {
      return { allowed: true };
    }

    // 2. Parse URL
    let hostname: string;
    try {
      const u = new URL(url);
      hostname = u.hostname;
    } catch (error) {
      // If it's not a valid URL, it might be an IP or a partial host.
      // For safety, if we can't parse it and we are in strict mode, block it.
      // However, tools might pass "google.com" without protocol.
      // Let's try prepending https:// if it fails.
      try {
        const u = new URL(`https://${url}`);
        hostname = u.hostname;
      } catch {
        return { allowed: false, reason: "Invalid URL format" };
      }
    }

    // 3. Check allowed domains (Allowlist)
    // If allowedDomains is defined, ONLY these are allowed.
    if (this.config.allowedDomains && this.config.allowedDomains.length > 0) {
      const isAllowed = this.config.allowedDomains.some((pattern) =>
        this.matchDomain(hostname, pattern),
      );

      if (!isAllowed) {
        return {
          allowed: false,
          reason: `Domain '${hostname}' is not in the allowed domains list.`,
        };
      }
    }

    // 4. Default Deny behavior (if no allowlist is matches... wait, allowlist implies default deny)
    // If allowlist is empty/undefined:
    // - If defaultDeny is true -> Block everything.
    // - If defaultDeny is false -> Allow everything (unless specific blocklist exists, which we haven't implemented yet).

    if (
      (!this.config.allowedDomains || this.config.allowedDomains.length === 0) &&
      this.config.defaultDeny
    ) {
      return {
        allowed: false,
        reason: "Network access denied by default (no allowed domains specified).",
      };
    }

    return { allowed: true };
  }

  /**
   * Matches a hostname against a pattern (supports wildcards).
   * Patterns:
   * - "google.com" -> EXACT match
   * - "*.google.com" -> SHARED SUFFIX match (maps.google.com, valid)
   * - "*" -> ALL match
   */
  private matchDomain(hostname: string, pattern: string): boolean {
    if (pattern === "*") return true;

    const host = hostname.toLowerCase();
    const pat = pattern.toLowerCase();

    if (host === pat) return true;

    if (pat.startsWith("*.")) {
      const suffix = pat.slice(2); // Remove "*."
      return host.endsWith(`.${suffix}`) || host === suffix;
    }

    return false;
  }
}
