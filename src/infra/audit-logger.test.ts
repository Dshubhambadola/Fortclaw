import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuditLogger } from "./audit-logger.js";
import fs from "node:fs";

vi.mock("node:fs", () => ({
  default: {
    mkdirSync: vi.fn(),
    appendFile: vi.fn(),
  },
}));

// Mock paths to avoid real FS access
vi.mock("../config/paths.js", () => ({
  resolveStateDir: () => "/tmp/mock-state",
}));

describe("AuditLogger", () => {
  let logger: AuditLogger;

  beforeEach(() => {
    vi.clearAllMocks();
    logger = new AuditLogger();
  });

  it("writes logs with correct structure", () => {
    logger.log({
      level: "INFO",
      action: "test.action",
      payload: { foo: "bar" },
    });

    expect(fs.appendFile).toHaveBeenCalled();
    const [path, content] = vi.mocked(fs.appendFile).mock.calls[0];

    expect(path).toContain("audit-");
    expect(path).toContain(".jsonl");

    const json = JSON.parse(content as string);
    expect(json.level).toBe("INFO");
    expect(json.action).toBe("test.action");
    expect(json.payload).toEqual({ foo: "bar" });
    expect(json.ts).toBeDefined();
  });

  it("sanitizes payloads in logs", () => {
    logger.log({
      level: "INFO",
      action: "login",
      payload: { password: "secret-password" },
    });

    const [, content] = vi.mocked(fs.appendFile).mock.calls[0];
    const json = JSON.parse(content as string);
    expect(json.payload.password).toBe("[REDACTED]");
  });
});
