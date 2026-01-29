import type { SecurityStatus } from "../../types/security";
import { Shield, Box, UserCheck, Eye, Network } from "lucide-react";
import { cn } from "../../lib/utils";

export function SecurityStatusPanel({ status }: { status: SecurityStatus }) {
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-slate-500 font-medium text-sm mb-4">System Status</h3>

            <div className="space-y-4">
                <StatusItem
                    label="Sandbox"
                    enabled={status.sandbox.enabled}
                    details={status.sandbox.mode === "all" ? "All Sessions" : "Non-Main Only"}
                    icon={Box}
                />
                <StatusItem
                    label="Input Validation"
                    enabled={status.inputValidation.enabled}
                    details={status.inputValidation.strictness + " strictness"}
                    icon={Shield}
                />
                <StatusItem
                    label="Human Approval"
                    enabled={status.humanApproval.enabled}
                    details={status.humanApproval.requireFor === "all" ? "All Ops" : "Dangerous Only"}
                    icon={UserCheck}
                />
                <StatusItem
                    label="Audit Logging"
                    enabled={status.audit.enabled}
                    details={`${status.audit.retention} day retention`}
                    icon={Eye}
                />
                <StatusItem
                    label="Network Filter"
                    enabled={status.network.egressFiltering}
                    details={status.network.anomalyDetection ? "+ Anomaly Detection" : "Basic Filter"}
                    icon={Network}
                />
            </div>
        </div>
    );
}

function StatusItem({ label, enabled, details, icon: Icon }: any) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={cn("w-2 h-2 rounded-full", enabled ? "bg-emerald-500" : "bg-slate-300")} />
                <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Icon size={14} className="text-slate-400" />
                    <span>{label}</span>
                </div>
            </div>
            <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">
                {enabled ? details : "Disabled"}
            </span>
        </div>
    );
}
