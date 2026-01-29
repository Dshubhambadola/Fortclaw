import { describe, expect, it, vi, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { STATE_DIR } from "../config/paths.js";
import { logAuditEntry } from "./runtime-audit.js";

// Mock fs to avoid writing to disk
vi.mock("node:fs");

describe("logAuditEntry", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("writes structured JSON log entry", () => {
    const entry = {
      runId: "run-123",
      toolName: "read",
      args: { path: "/etc/passwd" },
      result: { content: "secret" },
      isError: false,
      trustLevel: "L1",
    };

    logAuditEntry(entry);

    expect(fs.appendFileSync).toHaveBeenCalledTimes(1);
    const callArgs = vi.mocked(fs.appendFileSync).mock.calls[0];
    const logPath = callArgs[0] as string;
    const logContent = callArgs[1] as string;

    expect(logPath).toContain("audit.jsonl");
    const parsed = JSON.parse(logContent.trim());
    expect(parsed).toMatchObject({
      runId: "run-123",
      toolName: "read",
      args: { path: "/etc/passwd" },
      isError: false,
      trustLevel: "L1",
    });
    expect(parsed.timestamp).toBeDefined();
  });

  it("redacts sensitive data in args and result", () => {
    const entry = {
      runId: "run-456",
      toolName: "write",
      args: { content: "My API key is sk-12345678" },
      result: { status: "ok" },
      isError: false,
    };

    logAuditEntry(entry);

    const callArgs = vi.mocked(fs.appendFileSync).mock.calls[0];
    const logContent = callArgs[1] as string;
    const parsed = JSON.parse(logContent.trim());

    expect(parsed.args.content).toContain("***");
  });
});
