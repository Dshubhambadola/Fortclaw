import type {
  AgentTool,
  AgentToolResult,
  AgentToolUpdateCallback,
} from "@mariozechner/pi-agent-core";
import type { MoltbotConfig } from "../config/config.js";
import { shouldToolRequireApproval } from "./sandbox/tool-policy.js";
import type { SandboxToolPolicyResolved } from "./sandbox/types.js";
import { callGatewayTool } from "./tools/gateway.js";

type ApprovalWrapperOptions = {
  policy: SandboxToolPolicyResolved;
  config?: MoltbotConfig;
  agentId?: string;
  sessionKey?: string;
};

export function wrapToolWithApproval(tool: AgentTool, options: ApprovalWrapperOptions): AgentTool {
  if (!shouldToolRequireApproval(options.policy, tool.name)) {
    return tool;
  }

  return {
    ...tool,
    execute: async (
      toolCallId: string,
      params: unknown,
      signal?: AbortSignal,
      onUpdate?: AgentToolUpdateCallback<unknown>,
    ): Promise<AgentToolResult<unknown>> => {
      const approvalParams = {
        toolName: tool.name,
        params: params,
        agentId: options.agentId,
        sessionKey: options.sessionKey,
        timeoutMs: 120_000,
      };

      try {
        const result = await callGatewayTool<{ decision: string; id: string }>(
          "tool.approval.request",
          { timeoutMs: 130_000 },
          approvalParams,
        );

        if (result?.decision !== "approve") {
          throw new Error("Tool execution denied by user.");
        }

        return await tool.execute(toolCallId, params, signal, onUpdate);
      } catch (err) {
        // If the inner tool throws, we propagate it.
        // If the approval fails/denies, we also throw.
        throw err;
      }
    },
  };
}
