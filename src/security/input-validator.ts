export type ValidationResult = {
  isValid: boolean;
  score: number; // 0-100, where 100 is safe
  flags: string[];
  action: "allow" | "warn" | "block" | "quarantine";
};

export type InputValidationConfig = {
  strictness: "low" | "medium" | "high";
  allowPatterns?: RegExp[];
  blockPatterns?: RegExp[];
};

export class InputValidator {
  private config: InputValidationConfig;

  // Common injection patterns
  private static DANGEROUS_PATTERNS = [
    // SQL Injection (Basic)
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b.*\b(FROM|INTO|TABLE|DATABASE)\b)/i,
    // Command Injection
    /(;|\|\||&&)\s*(sudo|rm|shutdown|reboot|wget|curl|nc|bash|sh)\b/i,
    // Path Traversal
    /(\.\.\/|\.\.\\)/,
    // Script Injection / XSS
    /<script\b[^>]*>([\s\S]*?)<\/script>/i,
    /\bjavascript:/i,
  ];

  constructor(config: InputValidationConfig) {
    this.config = config;
  }

  public validateInput(text: string): ValidationResult {
    const flags: string[] = [];
    let score = 100;

    // 1. Check Allow Patterns (Whitelist) - mostly for specific command formats if needed
    if (this.config.allowPatterns) {
      for (const pattern of this.config.allowPatterns) {
        if (pattern.test(text)) {
          return { isValid: true, score: 100, flags: ["whitelisted"], action: "allow" };
        }
      }
    }

    // 2. Check Static Dangerous Patterns
    for (const pattern of InputValidator.DANGEROUS_PATTERNS) {
      if (pattern.test(text)) {
        flags.push("dangerous_pattern_match");
        score -= 50;
      }
    }

    // 3. Check Configured Block Patterns
    if (this.config.blockPatterns) {
      for (const pattern of this.config.blockPatterns) {
        if (pattern.test(text)) {
          flags.push("custom_block_match");
          score -= 40;
        }
      }
    }

    // 4. Strictness Logic
    let action: ValidationResult["action"] = "allow";
    if (score < 60) {
      if (this.config.strictness === "high") action = "block";
      else if (this.config.strictness === "medium") action = "warn";
    }

    // Critical failures always block in high/medium
    if (score < 20 && this.config.strictness !== "low") {
      action = "block";
    }

    return {
      isValid: action === "allow" || action === "warn",
      score,
      flags,
      action,
    };
  }
}
