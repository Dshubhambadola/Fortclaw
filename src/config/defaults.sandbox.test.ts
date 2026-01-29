import { describe, expect, it } from "vitest";

import { DEFAULT_SANDBOX_CONFIG } from "./defaults.js";

describe("DEFAULT_SANDBOX_CONFIG", () => {
  it("enforces secure defaults", () => {
    expect(DEFAULT_SANDBOX_CONFIG).toEqual({
      mode: "all",
      scope: "agent",
      workspaceAccess: "ro",
      docker: {
        network: "none",
        resources: {
          cpus: "1.0",
          memory: "1g",
          pids: 100,
          timeout: 300,
        },
      },
    });
  });
});
