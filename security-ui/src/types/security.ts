export type SecurityProfile = "development" | "personal" | "production" | "custom";

export interface SecurityStatus {
    sandbox: { enabled: boolean; mode: "off" | "non-main" | "all" };
    inputValidation: { enabled: boolean; strictness: "low" | "medium" | "high" };
    humanApproval: { enabled: boolean; requireFor: "all" | "exec" | string[] };
    audit: { enabled: boolean; retention: number };
    network: { egressFiltering: boolean; anomalyDetection: boolean };
}

export interface ApprovalRequest {
    id: string;
    agent: string;
    tool: string;
    operation: any;
    risk: "low" | "medium" | "high" | "critical";
    context: string;
    expiresAt: string; // ISO String
}

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface AuditEvent {
    id: string;
    timestamp: string;
    type: "tool_execution" | "approval_granted" | "approval_denied" | "input_blocked" | "network_blocked";
    actor: string;
    action: string;
    resource: string;
    outcome: "success" | "blocked" | "denied" | "error";
    severity: RiskLevel;
}

export interface Recommendation {
    id: string;
    title: string;
    description: string;
    severity: RiskLevel;
    actionLabel: string;
    actionId: string;
}

export interface DashboardData {
    score: number;
    profile: SecurityProfile;
    pendingApprovals: number;
    status: SecurityStatus;
    recentActivity: AuditEvent[];
    recommendations: Recommendation[];
}
