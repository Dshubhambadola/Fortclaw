import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

type ComplianceAction = "ACCESS" | "MODIFY" | "EXECUTE" | "CONNECT";
type ComplianceOutcome = "ALLOWED" | "DENIED" | "ERROR";
type ComplianceSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface ComplianceEvent {
  timestamp: string;
  eventId: string;
  actor: string;
  action: ComplianceAction;
  resource: string;
  outcome: ComplianceOutcome;
  severity: ComplianceSeverity;
  reason?: string;
  metadata?: Record<string, unknown>;
  hash?: string; // Integrity check
}

export class ComplianceLogger {
  private logPath: string;
  private enabled: boolean;

  constructor(enabled = true, logDir = "logs") {
    this.enabled = enabled;
    this.logPath = path.join(process.cwd(), logDir, "compliance.jsonl");
    if (this.enabled) {
      this.ensureLogDir(logDir);
    }
  }

  public logEvent(
    actor: string,
    action: ComplianceAction,
    resource: string,
    outcome: ComplianceOutcome,
    severity: ComplianceSeverity = "LOW",
    reason?: string,
    metadata?: Record<string, unknown>,
  ): void {
    if (!this.enabled) return;

    const event: ComplianceEvent = {
      timestamp: new Date().toISOString(),
      eventId: crypto.randomUUID(),
      actor,
      action,
      resource,
      outcome,
      severity,
      reason,
      metadata,
    };

    // Calculate integrity hash of the event content
    event.hash = this.calculateHash(event);

    this.writeLog(event);
  }

  private calculateHash(event: Omit<ComplianceEvent, "hash">): string {
    const content = `${event.timestamp}:${event.eventId}:${event.actor}:${event.action}:${event.resource}:${event.outcome}`;
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  private ensureLogDir(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private writeLog(event: ComplianceEvent) {
    try {
      fs.appendFileSync(this.logPath, JSON.stringify(event) + "\n");
    } catch (error) {
      console.error("Failed to write compliance log:", error);
    }
  }
}

// Singleton export
// In a real app, this might be initialized with config
export const complianceLogger = new ComplianceLogger(true);
