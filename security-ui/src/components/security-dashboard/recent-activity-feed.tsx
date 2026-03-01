import type { AuditEvent } from "../../types/security";
import { CheckCircle, XCircle, AlertTriangle, ShieldAlert, Terminal, Globe, HardDrive } from "lucide-react";
import { cn } from "../../lib/utils";

const icons: Record<string, any> = {
    tool_execution: Terminal,
    approval_granted: CheckCircle,
    approval_denied: XCircle,
    input_blocked: AlertTriangle,
    network_blocked: ShieldAlert,
    exec: Terminal,
    network: Globe,
    fs: HardDrive, // Note: HardDrive must be imported
    security_alert: ShieldAlert,
};

const colors: Record<string, string> = {
    success: "text-emerald-500 bg-emerald-50 border-emerald-100",
    blocked: "text-orange-500 bg-orange-50 border-orange-100",
    denied: "text-red-500 bg-red-50 border-red-100",
    error: "text-red-500 bg-red-50 border-red-100",
    failed: "text-slate-500 bg-slate-50 border-slate-100",
};

export function RecentActivityFeed({ activities }: { activities: AuditEvent[] }) {
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-2">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-500 font-medium text-sm">Recent Activity</h3>
                <button className="text-xs text-blue-600 hover:underline">View All</button>
            </div>

            <div className="space-y-4">
                {activities.map((event) => {
                    const Icon = icons[event.type];
                    return (
                        <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                            <div className={cn("mt-1 p-1.5 rounded-md border", colors[event.outcome])}>
                                <Icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-800 line-clamp-1">{event.action}</span>
                                    <span className="text-xs text-slate-400 whitespace-nowrap">
                                        {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-2">
                                    <span className={cn("px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider",
                                        event.severity === "critical" ? "bg-red-100 text-red-700" :
                                            event.severity === "high" ? "bg-orange-100 text-orange-700" :
                                                "bg-slate-100 text-slate-600"
                                    )}>
                                        {event.type.replace("_", " ")}
                                    </span>
                                    <span>•</span>
                                    <span className="truncate">{event.actor}</span>
                                    <span>•</span>
                                    <span className="truncate text-slate-400">{event.resource}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
