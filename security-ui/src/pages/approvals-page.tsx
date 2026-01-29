import { useState } from "react";
import { ApprovalRequestModal } from "../components/approvals/approval-request-modal";
import { PendingApprovalsWidget } from "../components/approvals/pending-approvals-widget";
import { useSecurityStore } from "../store/security-store";
import type { ApprovalRequest } from "../types/security";

export function ApprovalsPage() {
    const { pendingApprovals, removeApprovalRequest, addApprovalRequest } = useSecurityStore();
    const [activeRequest, setActiveRequest] = useState<ApprovalRequest | null>(null);

    const handleApprove = (id: string, mode: string) => {
        console.log(`Approved ${id} with mode ${mode}`);
        removeApprovalRequest(id);
        setActiveRequest(null);
    };

    const handleDeny = (id: string) => {
        console.log(`Denied ${id}`);
        removeApprovalRequest(id);
        setActiveRequest(null);
    };

    const simulateRequest = () => {
        const newReq: ApprovalRequest = {
            id: crypto.randomUUID(),
            agent: "dev-agent",
            tool: "exec",
            operation: { cmd: "rm -rf /" },
            risk: "critical",
            context: "Malicious command detected",
            expiresAt: new Date(Date.now() + 60000).toISOString()
        };
        addApprovalRequest(newReq);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">Approvals Center</h2>
                <button
                    onClick={simulateRequest}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 transition-colors"
                >
                    Simulate Incoming Request
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-800 mb-4">Pending Requests</h3>
                        {pendingApprovals.length === 0 ? (
                            <p className="text-slate-500 text-sm">No pending requests.</p>
                        ) : (
                            <div className="space-y-4">
                                {pendingApprovals.map(req => (
                                    <div key={req.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                        <div>
                                            <div className="font-medium text-slate-800">{req.tool} - {req.agent}</div>
                                            <code className="text-xs text-slate-500 font-mono mt-1 block max-w-md truncate">
                                                {JSON.stringify(req.operation)}
                                            </code>
                                        </div>
                                        <button
                                            onClick={() => setActiveRequest(req)}
                                            className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100"
                                        >
                                            Review
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-800 mb-4">Approval History</h3>
                        <p className="text-sm text-slate-500 italic">History view not implemented in Phase 5.3</p>
                    </div>
                </div>

                <div>
                    <PendingApprovalsWidget requests={pendingApprovals} />
                </div>
            </div>

            {/* Modal Layer */}
            {activeRequest && (
                <ApprovalRequestModal
                    request={activeRequest}
                    onApprove={(mode) => handleApprove(activeRequest.id, mode)}
                    onDeny={() => handleDeny(activeRequest.id)}
                />
            )}
        </div>
    );
}
