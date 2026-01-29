import type { MoltbotConfig } from "../../config/config.js";
import { resolveAgentConfig } from "../agent-scope.js";
import { expandToolGroups } from "../tool-policy.js";
import { DEFAULT_TOOL_ALLOW, DEFAULT_TOOL_DENY } from "./constants.js";
import type {
  SandboxToolPolicy,
  SandboxToolPolicyResolved,
  SandboxToolPolicySource,
} from "./types.js";

type CompiledPattern =
  | { kind: "all" }
  | { kind: "exact"; value: string }
  | { kind: "regex"; value: RegExp };

function compilePattern(pattern: string): CompiledPattern {
  const normalized = pattern.trim().toLowerCase();
  if (!normalized) return { kind: "exact", value: "" };
  if (normalized === "*") return { kind: "all" };
  if (!normalized.includes("*")) return { kind: "exact", value: normalized };
  const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return {
    kind: "regex",
    value: new RegExp(`^${escaped.replaceAll("\\*", ".*")}$`),
  };
}

function compilePatterns(patterns?: string[]): CompiledPattern[] {
  if (!Array.isArray(patterns)) return [];
  return expandToolGroups(patterns)
    .map(compilePattern)
    .filter((pattern) => pattern.kind !== "exact" || pattern.value);
}

function matchesAny(name: string, patterns: CompiledPattern[]): boolean {
  for (const pattern of patterns) {
    if (pattern.kind === "all") return true;
    if (pattern.kind === "exact" && name === pattern.value) return true;
    if (pattern.kind === "regex" && pattern.value.test(name)) return true;
  }
  return false;
}

export function isToolAllowed(policy: SandboxToolPolicy, name: string) {
  const normalized = name.trim().toLowerCase();
  const deny = compilePatterns(policy.deny);
  if (matchesAny(normalized, deny)) return false;
  const allow = compilePatterns(policy.allow);
  if (allow.length === 0) return true;
  return matchesAny(normalized, allow);
}

import { resolveAgentTrustLevel, resolveTrustLevelPolicy } from "../../config/trust-levels.js";
import { resolveSecurityConfig } from "../../config/security-resolver.js";

// ... (existing imports)

export function resolveSandboxToolPolicyForAgent(
  cfg?: MoltbotConfig,
  agentId?: string,
): SandboxToolPolicyResolved {
  const agentConfig = cfg && agentId ? resolveAgentConfig(cfg, agentId) : undefined;

  // Resolve Security Config
  const security = resolveSecurityConfig(cfg ?? {});

  // If sandbox is explicitly disabled by security profile (e.g. dev mode), allow all.
  if (security.config.sandbox.enabled === false) {
    return {
      allow: ["*"],
      deny: [],
      requireApproval: [], // Or should we still respect approval?
      // In Dev profile, approval is usually disabled too.
      // But if we want to be safe, we could check security.config.humanApproval.enabled
      sources: {
        allow: { source: "global", key: "security.sandbox.enabled=false" },
        deny: { source: "global", key: "security.sandbox.enabled=false" },
        requireApproval: { source: "global", key: "security.sandbox.enabled=false" },
      },
    };
  }

  // Resolve Trust Level Policy
  const trustLevel = resolveAgentTrustLevel(cfg ?? {}, agentId);
  const trustPolicy = resolveTrustLevelPolicy(trustLevel);

  const agentAllow = agentConfig?.tools?.sandbox?.tools?.allow;
  const agentDeny = agentConfig?.tools?.sandbox?.tools?.deny;
  const globalAllow = cfg?.tools?.sandbox?.tools?.allow;
  const globalDeny = cfg?.tools?.sandbox?.tools?.deny;

  const allowSource = Array.isArray(agentAllow)
    ? ({
        source: "agent",
        key: "agents.list[].tools.sandbox.tools.allow",
      } satisfies SandboxToolPolicySource)
    : Array.isArray(globalAllow)
      ? ({
          source: "global",
          key: "tools.sandbox.tools.allow",
        } satisfies SandboxToolPolicySource)
      : ({
          source: "default",
          key: `trust-level-${trustLevel}`,
        } satisfies SandboxToolPolicySource);

  const denySource = Array.isArray(agentDeny)
    ? ({
        source: "agent",
        key: "agents.list[].tools.sandbox.tools.deny",
      } satisfies SandboxToolPolicySource)
    : Array.isArray(globalDeny)
      ? ({
          source: "global",
          key: "tools.sandbox.tools.deny",
        } satisfies SandboxToolPolicySource)
      : ({
          source: "default",
          key: `trust-level-${trustLevel}`,
        } satisfies SandboxToolPolicySource);

  const deny = Array.isArray(agentDeny)
    ? agentDeny
    : Array.isArray(globalDeny)
      ? globalDeny
      : [...(trustPolicy.deny || [])];

  const allow = Array.isArray(agentAllow)
    ? agentAllow
    : Array.isArray(globalAllow)
      ? globalAllow
      : [...(trustPolicy.allow || [])];

  const agentRequireApproval = agentConfig?.tools?.sandbox?.tools?.requireApproval;
  const globalRequireApproval = cfg?.tools?.sandbox?.tools?.requireApproval;

  const requireApprovalSource = Array.isArray(agentRequireApproval)
    ? ({
        source: "agent",
        key: "agents.list[].tools.sandbox.tools.requireApproval",
      } satisfies SandboxToolPolicySource)
    : Array.isArray(globalRequireApproval)
      ? ({
          source: "global",
          key: "tools.sandbox.tools.requireApproval",
        } satisfies SandboxToolPolicySource)
      : ({
          source: "default",
          key: `trust-level-${trustLevel}`,
        } satisfies SandboxToolPolicySource);

  const requireApproval = Array.isArray(agentRequireApproval)
    ? agentRequireApproval
    : Array.isArray(globalRequireApproval)
      ? globalRequireApproval
      : [...(trustPolicy.requireApproval || [])];

  const expandedDeny = expandToolGroups(deny);
  let expandedAllow = expandToolGroups(allow);
  const expandedRequireApproval = expandToolGroups(requireApproval);

  // `image` is essential for multimodal workflows; always include it in sandboxed
  // sessions unless explicitly denied.
  if (
    !expandedDeny.map((v) => v.toLowerCase()).includes("image") &&
    !expandedAllow.map((v) => v.toLowerCase()).includes("image")
  ) {
    expandedAllow = [...expandedAllow, "image"];
  }

  return {
    allow: expandedAllow,
    deny: expandedDeny,
    requireApproval: expandedRequireApproval,
    sources: {
      allow: allowSource,
      deny: denySource,
      requireApproval: requireApprovalSource,
    },
  };
}

export function shouldToolRequireApproval(policy: SandboxToolPolicyResolved, name: string) {
  const normalized = name.trim().toLowerCase();
  const requireApproval = compilePatterns(policy.requireApproval);
  return matchesAny(normalized, requireApproval);
}
