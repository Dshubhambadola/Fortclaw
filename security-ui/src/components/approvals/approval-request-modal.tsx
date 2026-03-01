import type { ApprovalRequest } from "../../types/security";
import { useEffect, useState } from "react";
import { AlertTriangle, Clock, Terminal, Check, X, Shield } from "lucide-react";
import { cn } from "../../lib/utils";

interface ApprovalRequestModalProps {
    request: ApprovalRequest;
    onApprove: (mode: "once" | "session" | "always") => void;
    onDeny: () => void;
}

export function ApprovalRequestModal({ request, onApprove, onDeny }: ApprovalRequestModalProps) {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            const left = new Date(request.expiresAt).getTime() - Date.now();
            setTimeLeft(Math.max(0, left));
            if (left <= 0) onDeny();
        }, 1000);
        return () => clearInterval(timer);
    }, [request.expiresAt, onDeny]);

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="text-indigo-600" size={20} />
                        <h3 className="font-semibold text-slate-800">Approval Required</h3>
                    </div>
                    <div className={cn("flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full",
                        request.risk === "critical" ? "bg-red-100 text-red-700" :
                            request.risk === "high" ? "bg-orange-100 text-orange-700" :
                                "bg-yellow-100 text-yellow-700"
                    )}>
                        <AlertTriangle size={12} />
                        <span className="uppercase">{request.risk} Risk</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-slate-100 rounded-lg">
                            <Terminal size={24} className="text-slate-600" />
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Operation</div>
                            <code className="block bg-slate-900 text-green-400 p-3 rounded-md text-sm font-mono whitespace-pre-wrap break-all">
                                {JSON.stringify(request.operation, null, 2)}
                            </code>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-slate-500 block text-xs mb-1">Agent</span>
                            <span className="font-medium text-slate-800">{request.agent}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block text-xs mb-1">Tool</span>
                            <span className="font-medium text-slate-800">{request.tool}</span>
                        </div>
                    </div>

                    <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-md">
                        <span className="font-medium">Context: </span>
                        {request.context}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span className="flex items-center gap-1">
                            <Clock size={14} />
                            Expires automatically
                        </span>
                        <span className="font-mono font-medium text-slate-700">{minutes}m {seconds}s</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={onDeny}
                            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
                        >
                            <X size={16} /> Deny
                        </button>
                        <button
                            onClick={() => onApprove("once")}
                            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 transition-colors shadow-sm"
                        >
                            <Check size={16} /> Approve
                        </button>
                    </div>

                    <div className="flex justify-center gap-4 text-xs text-indigo-600 font-medium">
                        <button onClick={() => onApprove("session")} className="hover:underline">Approve for Session</button>
                        <button onClick={() => onApprove("always")} className="hover:underline">Approve Always</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
