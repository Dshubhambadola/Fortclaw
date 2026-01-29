import { create } from "zustand";
import type { ApprovalRequest, SecurityProfile, SecurityStatus, AuditEvent } from "../types/security";

interface SecurityState {
    score: number;
    profile: SecurityProfile;
    status: SecurityStatus;
    pendingApprovals: ApprovalRequest[];
    recentActivity: AuditEvent[];

    // Actions
    addApprovalRequest: (req: ApprovalRequest) => void;
    removeApprovalRequest: (id: string) => void;
    setProfile: (profile: SecurityProfile) => void;
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
    recentActivity: [],

    addApprovalRequest: (req) => set((state) => ({
        pendingApprovals: [...state.pendingApprovals, req]
    })),

    removeApprovalRequest: (id) => set((state) => ({
        pendingApprovals: state.pendingApprovals.filter(r => r.id !== id)
    })),

    setProfile: (profile) => set({ profile }),
}));
