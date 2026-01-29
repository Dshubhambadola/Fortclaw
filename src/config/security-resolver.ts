import type { MoltbotConfig } from "./types.clawdbot.js";
import {
  DEVELOPMENT_PROFILE,
  PERSONAL_PROFILE,
  PRODUCTION_PROFILE,
  type SecurityConfig,
  type SecurityProfile,
} from "./security-profiles.js";

type ResolvedSecurityResult = {
  profile: SecurityProfile;
  config: SecurityConfig;
  score: number;
  warnings: string[];
};

export function resolveSecurityConfig(
  userConfig: Partial<MoltbotConfig>,
  env: NodeJS.ProcessEnv = process.env,
): ResolvedSecurityResult {
  // 1. Determine profile
  const profile = determineProfile(userConfig, env);

  // 2. Load profile preset
  let preset: Partial<SecurityConfig> = {};
  if (profile === "development") preset = DEVELOPMENT_PROFILE;
  else if (profile === "production") preset = PRODUCTION_PROFILE;
  else if (profile === "personal") preset = PERSONAL_PROFILE;

  // 3. Merge user overrides
  const userSecurity = userConfig.security || {};

  const merged = deepMerge(preset, userSecurity) as SecurityConfig;
  // Ensure profile tag is correct
  merged.profile = profile;

  // 4. Calculate score (Basic implementation)
  const score = calculateSecurityScore(merged);

  return {
    profile,
    config: merged,
    score,
    warnings: [], // Warnings generation to be implemented in Phase 1.3
  };
}

function determineProfile(config: Partial<MoltbotConfig>, env: NodeJS.ProcessEnv): SecurityProfile {
  const envProfile = env.FORTCLAW_SECURITY_PROFILE || env.CLAWDBOT_SECURITY_PROFILE;
  if (isSecurityProfile(envProfile)) return envProfile;

  if (config.securityProfile && isSecurityProfile(config.securityProfile)) {
    return config.securityProfile;
  }

  if (env.NODE_ENV === "production") return "production";
  if (env.NODE_ENV === "development") return "development";

  return "personal";
}

function isSecurityProfile(val: unknown): val is SecurityProfile {
  return val === "development" || val === "personal" || val === "production" || val === "custom";
}

function calculateSecurityScore(config: SecurityConfig): number {
  let score = 0;

  if (config.sandbox?.enabled) {
    score += 20;
    if (config.sandbox.mode === "all") score += 5;
    if (config.sandbox.scope === "session") score += 5;
  }

  if (config.inputValidation?.enabled) {
    score += 15;
    if (config.inputValidation.strictness === "high") score += 5;
    if (config.inputValidation.mlDetection) score += 5;
  }

  if (config.humanApproval?.enabled) {
    score += 15;
    if (config.humanApproval.requireFor === "all") score += 5;
    if (config.humanApproval.multiApproval) score += 5;
  }

  if (config.audit?.enabled) {
    score += 5;
    if (config.audit.export) score += 3;
    if (config.audit.encryption) score += 2;
  }

  if (config.network?.egressFiltering) {
    score += 5;
    if (config.network.anomalyDetection) score += 5;
  }

  return score;
}

function deepMerge(target: any, source: any): any {
  if (typeof target !== "object" || target === null) return source;
  if (typeof source !== "object" || source === null) return source;
  if (Array.isArray(source)) return source; // Arrays overwrite

  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (Array.isArray(source[key])) {
      result[key] = source[key];
    } else if (typeof source[key] === "object" && source[key] !== null) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
