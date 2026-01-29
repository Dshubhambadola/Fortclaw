import { describe, expect, it } from "vitest";
import { resolveSandboxConfigForAgent } from "./config.js";
import {
  DEVELOPMENT_PROFILE,
  PERSONAL_PROFILE,
  PRODUCTION_PROFILE,
} from "../../config/security-profiles.js";

describe("resolveSandboxConfigForAgent with profiles", () => {
  it("uses personal profile defaults when no config provided", () => {
    // Default env is personal
    const config = resolveSandboxConfigForAgent({});
    expect(config.mode).toBe("non-main"); // Personal default
    expect(config.workspaceAccess).toBe("rw");
  });

  it("uses development profile values when specified", () => {
    const config = resolveSandboxConfigForAgent({
      securityProfile: "development",
    });
    expect(config.mode).toBe("off");
    expect(config.workspaceAccess).toBe("rw");
  });

  it("uses production profile values when specified", () => {
    const config = resolveSandboxConfigForAgent({
      securityProfile: "production",
    });
    expect(config.mode).toBe("all");
    expect(config.workspaceAccess).toBe("ro");
  });

  it("allows agent-specific overrides to take precedence over profile", () => {
    const config = resolveSandboxConfigForAgent(
      {
        securityProfile: "personal",
        agents: {
          defaults: {
            sandbox: { mode: "all" }, // Override default 'non-main'
          },
        },
      },
      "agent-1",
    );
    expect(config.mode).toBe("all");
  });
});
