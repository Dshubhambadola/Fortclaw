import type {
  AgentTool,
  AgentToolResult,
  AgentToolUpdateCallback,
} from "@mariozechner/pi-agent-core";
import { auditLogger } from "../infra/audit-logger.js";

type AuditWrapperOptions = {
  agentId?: string;
  sessionKey?: string;
};

export function wrapToolWithAudit(tool: AgentTool, options: AuditWrapperOptions): AgentTool {
  return {
    ...tool,
    execute: async (
      toolCallId: string,
      params: unknown,
      signal?: AbortSignal,
      onUpdate?: AgentToolUpdateCallback<unknown>,
    ): Promise<AgentToolResult<unknown>> => {
      const start = Date.now();
      const actor = {
        agentId: options.agentId,
        sessionKey: options.sessionKey,
      };

      try {
        const result = await tool.execute(toolCallId, params, signal, onUpdate);
        const durationMs = Date.now() - start;

        auditLogger.info("tool.execute", tool.name, actor, {
          payload: params,
          result,
          metadata: { durationMs, toolCallId },
        });

        return result;
      } catch (err: any) {
        const durationMs = Date.now() - start;
        auditLogger.error(
          "tool.execute",
          tool.name,
          actor,
          err instanceof Error ? err.message : String(err),
          {
            payload: params,
            metadata: {
              durationMs,
              toolCallId,
              stack: err instanceof Error ? err.stack : undefined,
            },
          },
        );
        throw err;
      }
    },
  };
}
