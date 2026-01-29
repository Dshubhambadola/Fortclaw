import { describe, expect, it } from "vitest";
import { resolveSecurityConfig } from "./security-resolver.js";
import { DEVELOPMENT_PROFILE, PERSONAL_PROFILE, PRODUCTION_PROFILE } from "./security-profiles.js";

describe("resolveSecurityConfig", () => {
  it("defaults to personal profile when no config/env provided", () => {
    const { profile, config } = resolveSecurityConfig({});
    expect(profile).toBe("personal");
    expect(config.sandbox.mode).toBe(PERSONAL_PROFILE.sandbox.mode);
  });

  it("prioritizes env var FORTCLAW_SECURITY_PROFILE", () => {
    const env = { FORTCLAW_SECURITY_PROFILE: "production" };
    const { profile, config } = resolveSecurityConfig({}, env);
    expect(profile).toBe("production");
    expect(config.sandbox.mode).toBe("all");
    expect(config.audit.retention).toBe(365);
  });

  it("prioritizes config.securityProfile over auto-detection", () => {
    const env = { NODE_ENV: "production" };
    // Even if NODE_ENV is production, explicit config says development
    const { profile } = resolveSecurityConfig({ securityProfile: "development" }, env);
    expect(profile).toBe("development");
  });

  it("auto-detects production from NODE_ENV", () => {
    const env = { NODE_ENV: "production" };
    const { profile } = resolveSecurityConfig({}, env);
    expect(profile).toBe("production");
  });

  it("merges user overrides into preset", () => {
    const { config } = resolveSecurityConfig({
      securityProfile: "personal",
      security: {
        sandbox: { mode: "all" }, // Override: force sandbox 'all' in personal
      },
    });

    expect(config.profile).toBe("personal");
    expect(config.sandbox.mode).toBe("all"); // Overridden
    expect(config.sandbox.workspaceAccess).toBe("rw"); // Inherited from Personal
  });

  it("calculates security score correctly", () => {
    // Production profile should have high score
    const { score } = resolveSecurityConfig({ securityProfile: "production" });
    expect(score).toBeGreaterThan(80);

    // Dev profile should have low score
    const { score: devScore } = resolveSecurityConfig({ securityProfile: "development" });
    expect(devScore).toBeLessThan(50);
  });
});
