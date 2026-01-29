import type { MoltbotConfig } from "./types.js";
import { resolveAgentConfig } from "../agents/agent-scope.js";
import { resolveSecurityConfig } from "./security-resolver.js";

export const TOOL_CATEGORIES = {
  safe: [
    "read",
    "web_search",
    "sessions_list",
    "sessions_history",
    "sessions_spawn",
    "session_status",
    "image",
  ],
  sensitive: ["write", "browser", "edit", "clipboard_read", "clipboard_write"],
  dangerous: ["exec", "apply_patch", "process", "tunnel_spawn", "serve_http", "mcp_client"],
} as const;

export type TrustLevel = "L1" | "L2" | "L3" | "L4";

export type TrustLevelPreset = {
  allow: readonly string[];
  deny?: readonly string[];
  requireApproval?: readonly string[];
  elevated?: readonly string[];
};

export const TRUST_LEVEL_PRESETS: Record<TrustLevel, TrustLevelPreset> = {
  L1: {
    allow: TOOL_CATEGORIES.safe,
    deny: ["*"], // Deny everything else
  },
  L2: {
    allow: [...TOOL_CATEGORIES.safe, ...TOOL_CATEGORIES.sensitive],
    deny: TOOL_CATEGORIES.dangerous,
  },
  L3: {
    allow: ["*"],
    deny: ["elevated"],
    requireApproval: ["exec"],
  },
  L4: {
    allow: ["*"],
    requireApproval: ["*"],
    elevated: ["systemctl"],
  },
} as const;

export function resolveAgentTrustLevel(cfg: MoltbotConfig, agentId?: string): TrustLevel {
  if (!agentId) return "L1";
  const agent = resolveAgentConfig(cfg, agentId);
  const configuredTrustLevel = agent?.trustLevel;

  if (configuredTrustLevel) return configuredTrustLevel;

  // Fallback to security profile default
  // We pass an empty env here because we can't easily thread it through everywhere yet,
  // but usually config is enough. If needed, we can expand signature.
  const security = resolveSecurityConfig(cfg);
  return security.config.defaultTrustLevel ?? "L1";
}

export function resolveTrustLevelPolicy(level: TrustLevel) {
  return TRUST_LEVEL_PRESETS[level];
}
