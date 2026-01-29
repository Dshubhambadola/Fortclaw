import fs from "node:fs";
import path from "node:path";
import { resolveStateDir } from "../config/paths.js";
import { Sanitizer } from "./sanitizer.js";

export type AuditLogLevel = "INFO" | "WARN" | "ERROR";

export type AuditActor = {
  agentId?: string;
  sessionKey?: string;
  userId?: string;
};

export type AuditLogEntry = {
  ts: string;
  level: AuditLogLevel;
  actor?: AuditActor;
  action: string;
  target?: string;
  payload?: unknown;
  result?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
};

export class AuditLogger {
  private logDir: string;

  constructor(env: NodeJS.ProcessEnv = process.env) {
    const stateDir = resolveStateDir(env);
    this.logDir = path.join(stateDir, "logs", "audit");
    try {
      fs.mkdirSync(this.logDir, { recursive: true });
    } catch (err) {
      // Fallback if we cannot create the directory?
      console.error("AuditLogger: failed to create log directory", err);
    }
  }

  log(entry: Omit<AuditLogEntry, "ts">) {
    try {
      const ts = new Date().toISOString();
      // Sanitize sensitive data
      const payload = entry.payload ? Sanitizer.sanitize(entry.payload) : undefined;
      const result = entry.result ? Sanitizer.sanitize(entry.result) : undefined;
      const metadata = entry.metadata
        ? (Sanitizer.sanitize(entry.metadata) as Record<string, unknown>)
        : undefined;

      const fullEntry: AuditLogEntry = {
        ts,
        level: entry.level,
        actor: entry.actor,
        action: entry.action,
        target: entry.target,
        payload,
        result,
        error: entry.error,
        metadata,
      };

      const dateStr = ts.split("T")[0]; // YYYY-MM-DD
      const filename = path.join(this.logDir, `audit-${dateStr}.jsonl`);
      const line = JSON.stringify(fullEntry) + "\n";

      fs.appendFile(filename, line, (err) => {
        if (err) {
          console.error("AuditLogger: failed to write log entry", err);
        }
      });
    } catch (err) {
      console.error("AuditLogger: failed to process log entry", err);
    }
  }

  info(
    action: string,
    target: string,
    actor?: AuditActor,
    data?: { payload?: unknown; result?: unknown; metadata?: Record<string, unknown> },
  ) {
    this.log({
      level: "INFO",
      action,
      target,
      actor,
      ...data,
    });
  }

  error(
    action: string,
    target: string,
    actor?: AuditActor,
    error?: string,
    data?: { payload?: unknown; metadata?: Record<string, unknown> },
  ) {
    this.log({
      level: "ERROR",
      action,
      target,
      actor,
      error,
      ...data,
    });
  }
}

export const auditLogger = new AuditLogger();
