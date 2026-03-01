import type { ApprovalRequest } from "../../types/security";
import { Clock, Check, X } from "lucide-react";
import { cn } from "../../lib/utils";

export function PendingApprovalsWidget({ requests }: { requests: ApprovalRequest[] }) {
    if (requests.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[160px]">
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-full mb-3">
                    <Check size={24} />
                </div>
                <h3 className="font-medium text-slate-800">No Pending Approvals</h3>
                <p className="text-sm text-slate-500 mt-1">All systems operating normally.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-500 font-medium text-sm">Pending Approvals</h3>
                <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {requests.length} Active
                </span>
            </div>

            <div className="space-y-3 flex-1 overflow-auto max-h-[200px]">
                {requests.map(req => (
                    <div key={req.id} className="p-3 bg-slate-50 rounded-lg text-sm border border-slate-100 relative group">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="font-medium text-slate-800">{req.tool}</div>
                                <div className="text-xs text-slate-500 truncate max-w-[180px]">{req.context}</div>
                            </div>
                            <div className={cn("text-[10px] uppercase font-bold px-1.5 py-0.5 rounded",
                                req.risk === "high" ? "bg-orange-100 text-orange-700" : "bg-slate-200 text-slate-600"
                            )}>
                                {req.risk}
                            </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                <Clock size={12} />
                                <span>Expires in 4m</span>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1 bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 rounded shadow-sm">
                                    <X size={14} />
                                </button>
                                <button className="p-1 bg-indigo-600 border border-transparent text-white hover:bg-indigo-700 rounded shadow-sm">
                                    <Check size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="mt-4 w-full text-center text-sm text-indigo-600 font-medium hover:underline py-2">
                View All Approvals
            </button>
        </div>
    );
}
