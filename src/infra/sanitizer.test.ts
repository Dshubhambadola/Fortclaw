import { describe, it, expect } from "vitest";
import { Sanitizer } from "./sanitizer.js";

describe("Sanitizer", () => {
  it("sanitizes strings with Bearer tokens", () => {
    const input = "Authorization: Bearer abc-123-def";
    const output = Sanitizer.sanitize(input);
    expect(output).toContain("[REDACTED]");
    expect(output).not.toContain("abc-123-def");
  });

  it("sanitizes strings with OpenAI keys", () => {
    const input = "Here is my key: sk-1234567890abcdef1234567890abcdef";
    const output = Sanitizer.sanitize(input);
    expect(output).toContain("[REDACTED]");
    expect(output).not.toContain("sk-");
  });

  it("sanitizes objects with secret keys", () => {
    const input = {
      user: "bob",
      password: "mySecretPassword123",
      meta: {
        api_key: "secure-token",
        other: "safe",
      },
    };
    const output = Sanitizer.sanitize(input);
    expect(output).toBeTypeOf("object");
    expect((output as any).password).toBe("[REDACTED]");
    expect((output as any).meta.api_key).toBe("[REDACTED]");
    expect((output as any).user).toBe("bob");
    expect((output as any).meta.other).toBe("safe");
  });

  it("sanitizes arrays", () => {
    const input = ["safe", "Bearer token123"];
    const output = Sanitizer.sanitize(input) as string[];
    expect(output[0]).toBe("safe");
    expect(output[1]).toContain("[REDACTED]");
  });
});
