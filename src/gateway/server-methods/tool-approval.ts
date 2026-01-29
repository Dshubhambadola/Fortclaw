import type { ToolApprovalDecision, ToolApprovalManager } from "../tool-approval-manager.js";
import {
  ErrorCodes,
  errorShape,
  formatValidationErrors,
  validateToolApprovalRequestParams,
  validateToolApprovalResolveParams,
} from "../protocol/index.js";
import type { GatewayRequestHandlers } from "./types.js";

export function createToolApprovalHandlers(manager: ToolApprovalManager): GatewayRequestHandlers {
  return {
    "tool.approval.request": async ({ params, respond, context }) => {
      if (!validateToolApprovalRequestParams(params)) {
        respond(
          false,
          undefined,
          errorShape(
            ErrorCodes.INVALID_REQUEST,
            `invalid tool.approval.request params: ${formatValidationErrors(
              validateToolApprovalRequestParams.errors,
            )}`,
          ),
        );
        return;
      }
      const p = params as {
        id?: string;
        toolName: string;
        params: Record<string, unknown>;
        agentId?: string;
        sessionKey?: string;
        summary?: string;
        timeoutMs?: number;
      };
      const timeoutMs = typeof p.timeoutMs === "number" ? p.timeoutMs : 120_000;
      const explicitId = typeof p.id === "string" && p.id.trim().length > 0 ? p.id.trim() : null;
      if (explicitId && manager.getSnapshot(explicitId)) {
        respond(
          false,
          undefined,
          errorShape(ErrorCodes.INVALID_REQUEST, "approval id already pending"),
        );
        return;
      }
      const request = {
        toolName: p.toolName,
        params: p.params,
        agentId: p.agentId ?? null,
        sessionKey: p.sessionKey ?? null,
        summary: p.summary ?? null,
      };
      const record = manager.create(request, timeoutMs, explicitId);
      const decisionPromise = manager.waitForDecision(record, timeoutMs);
      context.broadcast(
        "tool.approval.requested",
        {
          id: record.id,
          request: record.request,
          createdAtMs: record.createdAtMs,
          expiresAtMs: record.expiresAtMs,
        },
        { dropIfSlow: true },
      );

      const decision = await decisionPromise;
      respond(
        true,
        {
          id: record.id,
          decision,
          createdAtMs: record.createdAtMs,
          expiresAtMs: record.expiresAtMs,
        },
        undefined,
      );
    },
    "tool.approval.resolve": async ({ params, respond, client, context }) => {
      if (!validateToolApprovalResolveParams(params)) {
        respond(
          false,
          undefined,
          errorShape(
            ErrorCodes.INVALID_REQUEST,
            `invalid tool.approval.resolve params: ${formatValidationErrors(
              validateToolApprovalResolveParams.errors,
            )}`,
          ),
        );
        return;
      }
      const p = params as { id: string; decision: string };
      const decision = p.decision as ToolApprovalDecision;
      if (decision !== "approve" && decision !== "deny") {
        respond(
          false,
          undefined,
          errorShape(ErrorCodes.INVALID_REQUEST, "invalid decision (approve|deny)"),
        );
        return;
      }
      const resolvedBy = client?.connect?.client?.displayName ?? client?.connect?.client?.id;
      const ok = manager.resolve(p.id, decision, resolvedBy ?? null);
      if (!ok) {
        respond(false, undefined, errorShape(ErrorCodes.INVALID_REQUEST, "unknown approval id"));
        return;
      }
      context.broadcast(
        "tool.approval.resolved",
        { id: p.id, decision, resolvedBy, ts: Date.now() },
        { dropIfSlow: true },
      );
      respond(true, { ok: true }, undefined);
    },
  };
}
