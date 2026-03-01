import { describe, expect, it } from "vitest";
import { validateSecurityConfig } from "./security-resolver.js";
import {
  DEVELOPMENT_PROFILE,
  PERSONAL_PROFILE,
  PRODUCTION_PROFILE,
  type SecurityConfig,
} from "./security-profiles.js";

describe("validateSecurityConfig", () => {
  it("warns when using development profile in production env", () => {
    const env = { NODE_ENV: "production" };
    const warnings = validateSecurityConfig(
      "development",
      DEVELOPMENT_PROFILE,
      env as NodeJS.ProcessEnv,
    );
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("CRITICAL: Using 'development' security profile");
  });

  it("warns if sandbox is disabled in personal profile", () => {
    const config: SecurityConfig = {
      ...PERSONAL_PROFILE,
      sandbox: { ...PERSONAL_PROFILE.sandbox, enabled: false },
    };
    const warnings = validateSecurityConfig("personal", config, { NODE_ENV: "development" });
    expect(warnings).toContain(
      "Security Warning: Sandbox is disabled. Agents have full system access.",
    );
  });

  it("checks for production profile violations", () => {
    const config: SecurityConfig = {
      ...PRODUCTION_PROFILE,
      sandbox: { ...PRODUCTION_PROFILE.sandbox, enabled: false },
      audit: { ...PRODUCTION_PROFILE.audit, enabled: false },
      network: { ...PRODUCTION_PROFILE.network, egressFiltering: false },
    };
    const warnings = validateSecurityConfig("production", config, { NODE_ENV: "production" });

    expect(warnings).toContain("Production profile violation: Sandbox is DISABLED.");
    expect(warnings).toContain("Production profile violation: Audit logging is DISABLED.");
    expect(warnings).toContain("Production profile violation: Egress filtering is DISABLED.");
  });

  it("warns if human approval is disabled in production", () => {
    const config: SecurityConfig = {
      ...PRODUCTION_PROFILE,
      humanApproval: { ...PRODUCTION_PROFILE.humanApproval, enabled: false },
    };
    const warnings = validateSecurityConfig("production", config, { NODE_ENV: "production" });
    expect(warnings).toContain(
      "Security Warning: Human approval is disabled in production profile.",
    );
  });

  it("produces no warnings for standard production profile in prod env", () => {
    const warnings = validateSecurityConfig("production", PRODUCTION_PROFILE, {
      NODE_ENV: "production",
    } as NodeJS.ProcessEnv);
    expect(warnings).toHaveLength(0);
  });
});
