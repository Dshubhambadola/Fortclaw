import { randomUUID } from "node:crypto";

export type ToolApprovalDecision = "approve" | "deny";

export type ToolApprovalRequestPayload = {
  toolName: string;
  params: Record<string, unknown>;
  agentId?: string | null;
  sessionKey?: string | null;
  summary?: string | null;
};

export type ToolApprovalRecord = {
  id: string;
  request: ToolApprovalRequestPayload;
  createdAtMs: number;
  expiresAtMs: number;
  resolvedAtMs?: number;
  decision?: ToolApprovalDecision;
  resolvedBy?: string | null;
};

type PendingEntry = {
  record: ToolApprovalRecord;
  resolve: (decision: ToolApprovalDecision | null) => void;
  reject: (err: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

export class ToolApprovalManager {
  private pending = new Map<string, PendingEntry>();

  create(
    request: ToolApprovalRequestPayload,
    timeoutMs: number,
    id?: string | null,
  ): ToolApprovalRecord {
    const now = Date.now();
    const resolvedId = id && id.trim().length > 0 ? id.trim() : randomUUID();
    const record: ToolApprovalRecord = {
      id: resolvedId,
      request,
      createdAtMs: now,
      expiresAtMs: now + timeoutMs,
    };
    return record;
  }

  async waitForDecision(
    record: ToolApprovalRecord,
    timeoutMs: number,
  ): Promise<ToolApprovalDecision | null> {
    return await new Promise<ToolApprovalDecision | null>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(record.id);
        resolve(null);
      }, timeoutMs);
      this.pending.set(record.id, { record, resolve, reject, timer });
    });
  }

  resolve(recordId: string, decision: ToolApprovalDecision, resolvedBy?: string | null): boolean {
    const pending = this.pending.get(recordId);
    if (!pending) return false;
    clearTimeout(pending.timer);
    pending.record.resolvedAtMs = Date.now();
    pending.record.decision = decision;
    pending.record.resolvedBy = resolvedBy ?? null;
    this.pending.delete(recordId);
    pending.resolve(decision);
    return true;
  }

  getSnapshot(recordId: string): ToolApprovalRecord | null {
    const entry = this.pending.get(recordId);
    return entry?.record ?? null;
  }
}
