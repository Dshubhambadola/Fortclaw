import { describe, it, expect } from "vitest";
import { resolveSandboxToolPolicyForAgent, shouldToolRequireApproval } from "./tool-policy.js";
import type { MoltbotConfig } from "../../config/config.js";

describe("Sandbox Tool Policy - Approval", () => {
  it("resolves requireApproval from trust level defaults (L3)", () => {
    // defaults to L1 which denies exec but doesn't list approval explicitly?
    // Wait, L3 requires approval for 'exec'.
    const cfg: MoltbotConfig = {
      agents: {
        list: [
          {
            id: "test-agent",
            trustLevel: "L3",
          },
        ],
      },
    };

    const policy = resolveSandboxToolPolicyForAgent(cfg, "test-agent");
    expect(policy.requireApproval).toContain("exec");
    expect(shouldToolRequireApproval(policy, "exec")).toBe(true);
    expect(shouldToolRequireApproval(policy, "write")).toBe(false);
  });

  it("resolves requireApproval from global config", () => {
    const cfg: MoltbotConfig = {
      tools: {
        sandbox: {
          tools: {
            requireApproval: ["write", "edit"],
          },
        },
      },
    };

    const policy = resolveSandboxToolPolicyForAgent(cfg, "default-agent");
    expect(shouldToolRequireApproval(policy, "write")).toBe(true);
    expect(shouldToolRequireApproval(policy, "edit")).toBe(true);
    expect(shouldToolRequireApproval(policy, "exec")).toBe(false);
  });

  it("resolves requireApproval from agent config override", () => {
    const cfg: MoltbotConfig = {
      tools: {
        sandbox: {
          tools: {
            requireApproval: ["write"],
          },
        },
      },
      agents: {
        list: [
          {
            id: "paranoid-agent",
            tools: {
              sandbox: {
                tools: {
                  requireApproval: ["*"],
                },
              },
            },
          },
        ],
      },
    };

    const policy = resolveSandboxToolPolicyForAgent(cfg, "paranoid-agent");
    expect(shouldToolRequireApproval(policy, "read")).toBe(true);
    expect(shouldToolRequireApproval(policy, "write")).toBe(true);
  });
});
