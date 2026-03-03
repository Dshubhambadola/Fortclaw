/**
 * Structured security audit log for Fortclaw gateway.
 *
 * Every security-relevant event (auth failures, pairing decisions, token
 * rotations, rate limit hits, invocation denials) is recorded through this
 * module so that they can be queried, alerted on, and audited separately
 * from general gateway traffic logs.
 *
 * Each event is a single structured log line under the "security" subsystem.
 */

import type { createSubsystemLogger } from "../logging/subsystem.js";

type SubsystemLogger = ReturnType<typeof createSubsystemLogger>;

export type SecurityEventKind =
  | "auth.failure"
  | "auth.success"
  | "pairing.requested"
  | "pairing.approved"
  | "pairing.rejected"
  | "token.rotated"
  | "token.revoked"
  | "rate_limit.hit"
  | "node_invoke.denied"
  | "chat.size_exceeded"
  | "chat.concurrency_exceeded";

export type SecurityEvent = {
  kind: SecurityEventKind;
  /** WebSocket connection ID */
  connId?: string;
  /** Device ID (from device pairing) */
  deviceId?: string;
  /** Client role: operator | node */
  role?: string;
  /** Gateway method that triggered the event */
  method?: string;
  /** Human-readable reason for denial */
  reason?: string;
  /** Client IP, if available */
  remoteIp?: string;
  /** Millisecond timestamp (defaults to Date.now()) */
  ts?: number;
  /** Any extra context fields */
  extra?: Record<string, unknown>;
};

/**
 * Emit a structured security audit event.
 *
 * @param logger  A SubsystemLogger — pass `context.logGateway` or a
 *                dedicated `logSecurity` child logger from server.impl.ts.
 * @param event   The security event to record.
 */
export function auditLog(logger: SubsystemLogger, event: SecurityEvent): void {
  const { kind, ts, ...rest } = event;
  const timestamp = ts ?? Date.now();
  // Format as a single structured message that structured log parsers can query.
  const fields = Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined));
  logger.info(`[security] ${kind} ts=${timestamp} ${JSON.stringify(fields)}`);
}
