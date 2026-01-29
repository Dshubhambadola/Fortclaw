import fs from "node:fs";
import path from "node:path";
import { STATE_DIR } from "../config/paths.js";
import { redactSensitiveText } from "../logging/redact.js";

const AUDIT_LOG_PATH = path.join(STATE_DIR, "audit.jsonl");

export type AuditEntry = {
  timestamp: string;
  runId: string;
  agentId?: string;
  toolName: string;
  args?: unknown;
  result?: unknown;
  isError: boolean;
  trustLevel?: string;
};

export function logAuditEntry(entry: Omit<AuditEntry, "timestamp">) {
  try {
    const timestamp = new Date().toISOString();
    const payload = {
      timestamp,
      ...entry,
    };

    // Convert to JSON string
    let output = JSON.stringify(payload);

    // Redact sensitive data
    output = redactSensitiveText(output, { mode: "tools" });

    fs.appendFileSync(AUDIT_LOG_PATH, output + "\n");
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
