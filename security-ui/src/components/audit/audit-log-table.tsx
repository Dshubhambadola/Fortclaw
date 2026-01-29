import type { AuditEvent } from "../../types/security";
import { cn } from "../../lib/utils";
import { AlertCircle, CheckCircle, XCircle, Shield, Terminal, Globe, HardDrive } from "lucide-react";

const severityColors = {
    low: "bg-blue-50 text-blue-700 border-blue-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    high: "bg-orange-50 text-orange-700 border-orange-200",
    critical: "bg-red-50 text-red-700 border-red-200",
};

const outcomeIcons: Record<string, any> = {
    success: <CheckCircle className="w-4 h-4 text-emerald-500" />,
    denied: <XCircle className="w-4 h-4 text-amber-500" />,
    blocked: <Shield className="w-4 h-4 text-red-500" />,
    failed: <AlertCircle className="w-4 h-4 text-slate-500" />,
};

const typeIcons: Record<string, any> = {
    exec: Terminal,
    network: Globe,
    fs: HardDrive,
};

export function AuditLogTable({ logs }: { logs: AuditEvent[] }) {
    if (logs.length === 0) {
        return (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-slate-900 font-medium mb-1">No Audit Logs Found</h3>
                <p className="text-slate-500 text-sm">Try adjusting your filters or search query.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                            <th className="px-6 py-4 w-48">Timestamp</th>
                            <th className="px-6 py-4 w-24">Severity</th>
                            <th className="px-6 py-4 w-32">Actor</th>
                            <th className="px-6 py-4">Action</th>
                            <th className="px-6 py-4 w-24 text-center">Outcome</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {logs.map((log) => {
                            const Icon = typeIcons[log.type] || Shield;
                            return (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4 text-slate-500 font-mono text-xs whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", severityColors[log.severity])}>
                                            {log.severity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-slate-100 rounded text-slate-500">
                                                <Icon className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="font-medium text-slate-700">{log.actor}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-slate-900 font-medium truncate max-w-md">{log.action}</span>
                                            <code className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-md">{log.resource}</code>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center" title={log.outcome}>
                                            {outcomeIcons[log.outcome]}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
