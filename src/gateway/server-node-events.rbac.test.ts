import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../infra/system-events.js", () => ({
  enqueueSystemEvent: vi.fn(),
}));
vi.mock("../infra/heartbeat-wake.js", () => ({
  requestHeartbeatNow: vi.fn(),
}));
vi.mock("../commands/agent.js", () => ({
  agentCommand: vi.fn().mockResolvedValue(undefined),
}));

import { agentCommand } from "../commands/agent.js";
import { handleNodeEvent } from "./server-node-events.js";
import type { NodeEventContext } from "./server-node-events-types.js";
import type { CliDeps } from "../cli/deps.js";
import type { HealthSummary } from "../commands/health.js";

const agentCommandMock = vi.mocked(agentCommand);

function buildCtx(overrides?: Partial<NodeEventContext>): NodeEventContext {
  return {
    deps: {} as CliDeps,
    broadcast: () => {},
    nodeSendToSession: () => {},
    nodeSubscribe: () => {},
    nodeUnsubscribe: () => {},
    broadcastVoiceWakeChanged: () => {},
    addChatRun: () => {},
    removeChatRun: () => undefined,
    chatAbortControllers: new Map(),
    chatAbortedRuns: new Map(),
    chatRunBuffers: new Map(),
    chatDeltaSentAt: new Map(),
    dedupe: new Map(),
    agentRunSeq: new Map(),
    getHealthCache: () => null,
    refreshHealthSnapshot: async () => ({}) as HealthSummary,
    loadGatewayModelCatalog: async () => [],
    logGateway: { warn: vi.fn() },
    sourceRole: "node",
    validPermissions: [],
    ...overrides,
  };
}

describe("node RBAC events", () => {
  beforeEach(() => {
    agentCommandMock.mockClear();
  });

  it("denies agent.request if no permissions", async () => {
    const logWarn = vi.fn();
    const ctx = buildCtx({
      logGateway: { warn: logWarn },
      validPermissions: [],
    });

    await handleNodeEvent(ctx, "rogue-node", {
      event: "agent.request",
      payloadJSON: JSON.stringify({ message: "hack" }),
    });

    expect(agentCommandMock).not.toHaveBeenCalled();
    expect(logWarn).toHaveBeenCalledWith(
      expect.stringContaining("missing agent:coordinator permission"),
    );
  });

  it("allows agent.request if has agent:coordinator permission", async () => {
    const ctx = buildCtx({
      validPermissions: ["agent:coordinator"],
    });

    await handleNodeEvent(ctx, "coord-node", {
      event: "agent.request",
      payloadJSON: JSON.stringify({ message: "legit task" }),
    });

    expect(agentCommandMock).toHaveBeenCalled();
  });

  it("allows agent.request if sourceRole is admin", async () => {
    const ctx = buildCtx({
      sourceRole: "admin",
    });

    await handleNodeEvent(ctx, "admin-node", {
      event: "agent.request",
      payloadJSON: JSON.stringify({ message: "admin task" }),
    });

    expect(agentCommandMock).toHaveBeenCalled();
  });
});
