import { describe, it, expect, vi, beforeEach } from "vitest";
import { wrapToolWithNetwork } from "./pi-tools.network.js";
import { AgentTool } from "@mariozechner/pi-agent-core";
import * as securityResolver from "../config/security-resolver.js";

// Mock resolveSecurityConfig
vi.mock("../config/security-resolver.js", () => ({
  resolveSecurityConfig: vi.fn(),
}));

// Mock complianceLogger
vi.mock("../security/compliance-logger.js", () => ({
  complianceLogger: {
    logEvent: vi.fn(),
  },
}));

describe("wrapToolWithNetwork", () => {
  const mockExecute = vi.fn();
  const mockTool: AgentTool = {
    name: "web_fetch",
    label: "Web Fetch",
    description: "Fetches a URL",
    parameters: {} as any,
    execute: mockExecute,
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("blocks access to denied domains", async () => {
    (securityResolver.resolveSecurityConfig as any).mockReturnValue({
      config: {
        network: {
          egressFiltering: true,
          allowedDomains: ["google.com"],
        },
      },
    });

    const wrapped = wrapToolWithNetwork(mockTool);
    const params = { url: "https://evil.com" };

    await expect(wrapped.execute("call-1", params)).rejects.toThrow("Security Violation");
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it("allows access to allowed domains", async () => {
    (securityResolver.resolveSecurityConfig as any).mockReturnValue({
      config: {
        network: {
          egressFiltering: true,
          allowedDomains: ["google.com"],
        },
      },
    });

    const wrapped = wrapToolWithNetwork(mockTool);
    const params = { url: "https://google.com/foo" };

    mockExecute.mockResolvedValue("success");
    await expect(wrapped.execute("call-1", params)).resolves.toBe("success");
    expect(mockExecute).toHaveBeenCalled();
  });

  it("allows everything if egressFiltering is false", async () => {
    (securityResolver.resolveSecurityConfig as any).mockReturnValue({
      config: {
        network: {
          egressFiltering: false,
        },
      },
    });

    const wrapped = wrapToolWithNetwork(mockTool);
    const params = { url: "https://evil.com" };

    mockExecute.mockResolvedValue("success");
    await expect(wrapped.execute("call-1", params)).resolves.toBe("success");
    expect(mockExecute).toHaveBeenCalled();
  });
});
