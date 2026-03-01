import { describe, expect, it } from "vitest";
import { InputValidator } from "./input-validator.js";

describe("InputValidator", () => {
  const highStrictness = new InputValidator({ strictness: "high" });
  const lowStrictness = new InputValidator({ strictness: "low" });

  it("allows safe input", () => {
    const result = highStrictness.validateInput("Hello, how are you?");
    expect(result.isValid).toBe(true);
    expect(result.action).toBe("allow");
    expect(result.score).toBe(100);
  });

  it("blocks SQL injection in high strictness", () => {
    const result = highStrictness.validateInput("SELECT * FROM users;");
    expect(result.action).toBe("block");
    expect(result.flags).toContain("dangerous_pattern_match");
  });

  it("warns/allows SQL injection in low strictness", () => {
    const result = lowStrictness.validateInput("SELECT * FROM users;");
    expect(result.isValid).toBe(true); // Should valid (allow/warn) but not block
    expect(result.flags).toContain("dangerous_pattern_match");
  });

  it("detects command injection attempts", () => {
    const result = highStrictness.validateInput("some command; rm -rf /");
    expect(result.action).toBe("block");
    expect(result.flags).toContain("dangerous_pattern_match");
  });

  it("respects allowed patterns (whitelist)", () => {
    const validator = new InputValidator({
      strictness: "high",
      allowPatterns: [/^SAFE:.*/],
    });
    // Normally this might trigger something if it matched a bad pattern, but here we just check checking whitelist works
    const result = validator.validateInput("SAFE: SELECT * FROM users");
    expect(result.action).toBe("allow");
    expect(result.flags).toContain("whitelisted");
  });
});
