import type {
  AgentTool,
  AgentToolResult,
  AgentToolUpdateCallback,
} from "@mariozechner/pi-agent-core";
import { resolveSecurityConfig } from "../config/security-resolver.js";
import { NetworkFilter } from "../infra/network-filter.js";
import { networkMonitor } from "../infra/network-monitor.js";
import { complianceLogger } from "../security/compliance-logger.js";
import type { MoltbotConfig } from "../config/config.js";

type NetworkWrapperOptions = {
  config?: MoltbotConfig;
  agentId?: string;
};

export function wrapToolWithNetwork(tool: AgentTool, options?: NetworkWrapperOptions): AgentTool {
  return {
    ...tool,
    execute: async (
      toolCallId: string,
      params: unknown,
      signal?: AbortSignal,
      onUpdate?: AgentToolUpdateCallback<unknown>,
    ): Promise<AgentToolResult<unknown>> => {
      // 1. Resolve Security Policy
      const security = resolveSecurityConfig(options?.config ?? {});
      const filter = new NetworkFilter(security.config.network);

      // 2. Identify URL to validate
      let targetUrl: string | undefined;

      // Extract URL based on known tool patterns
      if (typeof params === "object" && params !== null) {
        // Safe cast to access properties
        const p = params as Record<string, unknown>;
        if (typeof p.url === "string") {
          targetUrl = p.url;
        }
      }

      // 3. Validate
      if (targetUrl) {
        const agentId = options?.agentId || "unknown";

        // Domain Check
        const filterResult = filter.validate(targetUrl);
        if (!filterResult.allowed) {
          complianceLogger.logEvent(
            agentId,
            "CONNECT",
            targetUrl,
            "DENIED",
            "HIGH",
            `Policy Violation: ${filterResult.reason}`,
          );
          throw new Error(
            `Security Violation: Access to '${targetUrl}' is blocked by network policy. ${
              filterResult.reason || ""
            }`,
          );
        }

        // Anomaly Check (Rate limit, ports, etc.)
        const monitorResult = networkMonitor.check(agentId, targetUrl, security.config.network);

        if (!monitorResult.allowed) {
          complianceLogger.logEvent(
            agentId,
            "CONNECT",
            targetUrl,
            "DENIED",
            "HIGH",
            `Anomaly Detected: ${monitorResult.reason}`,
          );
          throw new Error(
            `Network Anomaly Detected: Access blocked. ${monitorResult.reason || ""}`,
          );
        }

        // Log successful connection attempt
        complianceLogger.logEvent(
          agentId,
          "CONNECT",
          targetUrl,
          "ALLOWED",
          "LOW",
          "Passed all checks",
        );
      }

      // 4. Execute
      return tool.execute(toolCallId, params, signal, onUpdate);
    },
  };
}
