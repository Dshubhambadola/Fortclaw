import { create } from "zustand";
import type { ApprovalRequest, SecurityProfile, SecurityStatus, AuditEvent, SecurityHealth } from "../types/security";

interface SecurityState {
    score: number;
    profile: SecurityProfile;
    status: SecurityStatus;
    pendingApprovals: ApprovalRequest[];
    recentActivity: AuditEvent[];
    systemHealth: SecurityHealth;

    // Actions
    addApprovalRequest: (req: ApprovalRequest) => void;
    removeApprovalRequest: (id: string) => void;
    updateStatus: (updates: Partial<SecurityStatus>) => void;
    setProfile: (profile: SecurityProfile) => void;
    setHealth: (health: SecurityHealth) => void;
}

const mockRequests: ApprovalRequest[] = [
    {
        id: "req-1",
        agent: "personal-telegram",
        tool: "exec",
        operation: { command: "git push origin main" },
        risk: "medium",
        context: "Push security UI changes",
        expiresAt: new Date(Date.now() + 1000 * 60 * 5).toISOString(),
    }
];

export const useSecurityStore = create<SecurityState>((set) => ({
    score: 68,
    profile: "personal",
    status: {
        sandbox: { enabled: true, mode: "non-main" },
        inputValidation: { enabled: true, strictness: "medium" },
        humanApproval: { enabled: true, requireFor: "exec" },
        audit: { enabled: true, retention: 30 },
        network: { egressFiltering: false, anomalyDetection: false },
    },
    pendingApprovals: mockRequests,
    recentActivity: [
        {
            id: "1",
            timestamp: new Date().toISOString(),
            type: "approval_granted",
            actor: "@shubham",
            action: "git push origin feature/ui",
            resource: "repo:fortclaw",
            outcome: "success",
            severity: "medium",
        },
        {
            id: "2",
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            type: "input_blocked",
            actor: "system",
            action: "Prompt Injection Detected",
            resource: "input:chat",
            outcome: "blocked",
            severity: "high",
        },
        {
            id: "3",
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            type: "exec",
            actor: "agent-1",
            action: "read file.txt",
            resource: "fs:/etc/hosts",
            outcome: "success",
            severity: "low",
        },
        {
            id: "4",
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            type: "network",
            actor: "agent-mal",
            action: "CONNECT 192.168.1.1:22",
            resource: "net:ssh",
            outcome: "denied",
            severity: "critical",
        },
        {
            id: "5",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            type: "exec",
            actor: "dev-agent",
            action: "npm install",
            resource: "fs:package.json",
            outcome: "success",
            severity: "low",
        },
        {
            id: "6",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
            type: "fs",
            actor: "dev-agent",
            action: "write secrets.env",
            resource: "fs:.env",
            outcome: "blocked",
            severity: "high",
        }
    ],

    addApprovalRequest: (req) => set((state) => ({
        pendingApprovals: [...state.pendingApprovals, req]
    })),

    updateStatus: (updates: Partial<SecurityStatus>) => set((state) => {
        // Deep merge logic for status updates
        const newStatus = { ...state.status };
        for (const [key, value] of Object.entries(updates)) {
            // @ts-ignore - dynamic key access
            newStatus[key] = { ...newStatus[key], ...value };
        }
        return { status: newStatus };
    }),

    removeApprovalRequest: (id) => set((state) => ({
        pendingApprovals: state.pendingApprovals.filter(r => r.id !== id)
    })),

    setProfile: (profile) => set({ profile }),
    setHealth: (health) => set({ systemHealth: health }),

    systemHealth: {
        overallStatus: 'healthy',
        lastUpdated: new Date().toISOString(),
        components: [
            { id: 'gateway', name: 'Security Gateway', status: 'healthy', latency: 12, lastCheck: new Date().toISOString() },
            { id: 'database', name: 'Policy Database', status: 'healthy', latency: 5, lastCheck: new Date().toISOString() },
            { id: 'hooks', name: 'Agent Hooks', status: 'healthy', message: 'All hooks active', lastCheck: new Date().toISOString() },
            { id: 'scanner', name: 'Vulnerability Scanner', status: 'unknown', message: 'Idle', lastCheck: new Date().toISOString() },
        ]
    }
}));
