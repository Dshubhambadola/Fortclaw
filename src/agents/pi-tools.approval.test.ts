import { describe, it, expect, vi, beforeEach } from "vitest";
import { wrapToolWithApproval } from "./pi-tools.approval.js";
import { callGatewayTool } from "./tools/gateway.js";
import type { AgentTool } from "@mariozechner/pi-agent-core";
import { SandboxToolPolicyResolved, SandboxToolPolicySource } from "./sandbox/types.js";

vi.mock("./tools/gateway.js", () => ({
  callGatewayTool: vi.fn(),
  resolveGatewayOptions: vi.fn(),
}));

const mockExecute = vi.fn().mockResolvedValue({ content: "ok" });
const baseTool: AgentTool = {
  name: "sensitive-tool",
  description: "desc",
  parameters: { type: "object", properties: {} },
  execute: mockExecute,
} as unknown as AgentTool;

const dummySource: SandboxToolPolicySource = { source: "default", key: "test" };

describe("wrapToolWithApproval", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips approval if policy says so", async () => {
    const policy: SandboxToolPolicyResolved = {
      requireApproval: [],
      allow: [],
      deny: [],
      sources: { allow: dummySource, deny: dummySource, requireApproval: dummySource },
    };
    const wrapped = wrapToolWithApproval(baseTool, { policy });

    await wrapped.execute("id", {}, undefined, undefined);
    expect(vi.mocked(callGatewayTool)).not.toHaveBeenCalled();
    expect(mockExecute).toHaveBeenCalled();
  });

  it("requests approval if policy requires it", async () => {
    const policy: SandboxToolPolicyResolved = {
      requireApproval: ["sensitive-tool"],
      allow: [],
      deny: [],
      sources: { allow: dummySource, deny: dummySource, requireApproval: dummySource },
    };
    const wrapped = wrapToolWithApproval(baseTool, { policy });

    // Mock gateway approve
    vi.mocked(callGatewayTool).mockResolvedValue({ decision: "approve", id: "123" });

    await wrapped.execute("id", { foo: "bar" }, undefined, undefined);

    expect(vi.mocked(callGatewayTool)).toHaveBeenCalledWith(
      "tool.approval.request",
      expect.anything(),
      expect.objectContaining({
        toolName: "sensitive-tool",
        params: { foo: "bar" },
      }),
    );
    expect(mockExecute).toHaveBeenCalled();
  });

  it("throws if approval is denied", async () => {
    const policy: SandboxToolPolicyResolved = {
      requireApproval: ["sensitive-tool"],
      allow: [],
      deny: [],
      sources: { allow: dummySource, deny: dummySource, requireApproval: dummySource },
    };
    const wrapped = wrapToolWithApproval(baseTool, { policy });

    // Mock gateway deny
    vi.mocked(callGatewayTool).mockResolvedValue({ decision: "deny", id: "123" });

    await expect(wrapped.execute("id", {}, undefined, undefined)).rejects.toThrow("denied");
    expect(mockExecute).not.toHaveBeenCalled();
  });
});
