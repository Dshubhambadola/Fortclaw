import type { SandboxDockerSettings } from "./types.sandbox.js";

/**
 * Security Profile Selection
 */
export type SecurityProfile = "development" | "personal" | "production" | "custom";

/**
 * Detailed Security Configuration
 */
export type SecurityConfig = {
  profile?: SecurityProfile;

  sandbox: {
    enabled: boolean;
    mode: "off" | "non-main" | "all";
    scope: "session" | "agent" | "shared";
    workspaceAccess: "none" | "ro" | "rw";
    runtime?: "runc" | "gvisor";
    resources?: SandboxDockerSettings;
    warnings?: boolean;
    canOverride?: boolean;
  };

  inputValidation: {
    enabled: boolean;
    strictness: "low" | "medium" | "high";
    logOnly?: boolean;
    mlDetection?: boolean;
    allowUserOverride?: boolean;
    quarantine?: boolean;
    customPatterns?: RegExp[];
    allowPatterns?: RegExp[];
  };

  humanApproval: {
    enabled: boolean;
    requireFor: "all" | "exec" | string[];
    timeout?: number;
    multiApproval?: {
      critical?: number;
      elevated?: number;
    };
    rememberChoice?: boolean;
    batchApproval?: boolean;
    auditApprovals?: boolean;
    dryRun?: boolean;
  };

  audit: {
    enabled: boolean;
    level: "debug" | "info" | "warn" | "error";
    retention?: number; // days
    export?: boolean;
    encryption?: boolean;
    immutable?: boolean;
    redactSecrets?: boolean;
    filterSensitiveData?: boolean;
    customRedactions?: RegExp[];
    destinations?: string[];
  };

  network: {
    egressFiltering: boolean;
    dnsFiltering?: boolean;
    rateLimiting?: boolean;
    anomalyDetection?: boolean;
    alertOnBlocked?: boolean;
    defaultDeny?: boolean;
    monitoring?: boolean;
    allowedDomains?: string[];
  };

  warnings?: {
    showOnStartup?: boolean;
    requireAcknowledgment?: boolean;
    showOnDangerousOp?: boolean;
    strictMode?: boolean;
    educational?: boolean;
    interval?: number;
    showSuccessMessage?: boolean;
  };

  compliance?: {
    soc2?: boolean;
    gdpr?: boolean;
    hipaa?: boolean;
    reports?: {
      daily?: boolean;
      weekly?: boolean;
      monthly?: boolean;
    };
  };
};

/**
 * Profile 1: Development (Maximum Flexibility)
 */
export const DEVELOPMENT_PROFILE: SecurityConfig = {
  profile: "development",
  sandbox: {
    enabled: false,
    mode: "off",
    scope: "agent",
    workspaceAccess: "rw",
    warnings: true,
    canOverride: false,
  },
  inputValidation: {
    enabled: true,
    strictness: "low",
    logOnly: true,
  },
  humanApproval: {
    enabled: false,
    requireFor: [],
    dryRun: true,
  },
  audit: {
    enabled: true,
    level: "debug",
    retention: 7,
    export: false,
  },
  network: {
    egressFiltering: false,
    rateLimiting: false,
    monitoring: true,
  },
  warnings: {
    showOnStartup: true,
    requireAcknowledgment: true,
    interval: 3600,
  },
};

/**
 * Profile 2: Personal (Balanced - DEFAULT)
 */
export const PERSONAL_PROFILE: SecurityConfig = {
  profile: "personal",
  sandbox: {
    enabled: true,
    mode: "non-main",
    scope: "agent",
    workspaceAccess: "rw",
  },
  inputValidation: {
    enabled: true,
    strictness: "medium",
    logOnly: false,
    allowUserOverride: true,
  },
  humanApproval: {
    enabled: true,
    requireFor: ["exec", "elevated"],
    timeout: 300,
    rememberChoice: true,
    batchApproval: true,
  },
  audit: {
    enabled: true,
    level: "info",
    retention: 30,
    export: false,
    redactSecrets: true,
  },
  network: {
    egressFiltering: false,
    rateLimiting: true,
    monitoring: true,
    alertOnBlocked: true, // Renamed from alertOnUnusual to match definition
  },
  warnings: {
    showOnStartup: false,
    showOnDangerousOp: true,
    educational: true,
  },
};

/**
 * Profile 3: Production (Maximum Security)
 */
export const PRODUCTION_PROFILE: SecurityConfig = {
  profile: "production",
  sandbox: {
    enabled: true,
    mode: "all",
    scope: "session",
    workspaceAccess: "ro",
    runtime: "gvisor",
  },
  inputValidation: {
    enabled: true,
    strictness: "high",
    logOnly: false,
    mlDetection: true,
    allowUserOverride: false,
    quarantine: true,
  },
  humanApproval: {
    enabled: true,
    requireFor: "all",
    timeout: 180,
    multiApproval: {
      critical: 2,
      elevated: 2,
    },
    rememberChoice: false,
    batchApproval: false,
    auditApprovals: true,
  },
  audit: {
    enabled: true,
    level: "info",
    retention: 365,
    export: true,
    encryption: true,
    immutable: true,
    destinations: ["cloudwatch", "s3", "syslog"],
  },
  network: {
    egressFiltering: true,
    dnsFiltering: true,
    rateLimiting: true,
    anomalyDetection: true,
    alertOnBlocked: true,
    defaultDeny: true,
  },
  warnings: {
    showOnStartup: false,
    showSuccessMessage: true,
    strictMode: true,
  },
  compliance: {
    soc2: true,
    gdpr: true,
    hipaa: false,
    reports: {
      daily: true,
      weekly: true,
      monthly: true,
    },
  },
};

export const SECURITY_PROFILES = {
  development: DEVELOPMENT_PROFILE,
  personal: PERSONAL_PROFILE,
  production: PRODUCTION_PROFILE,
} as const;
