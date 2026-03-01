import { useSecurityStore } from "../store/security-store";
import { HealthStatusBadge } from "../components/health/health-status-badge";
import { Server, Database, Activity, ShieldCheck, RefreshCw } from "lucide-react";
import type { SystemComponent } from "../types/security";

export function SecurityHealthPage() {
    const { systemHealth } = useSecurityStore();

    const getIcon = (id: string) => {
        switch (id) {
            case 'gateway': return Server;
            case 'database': return Database;
            case 'hooks': return Activity;
            case 'scanner': return ShieldCheck;
            default: return Server;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Security Health Check</h2>
                <p className="text-sm text-slate-500 mt-1">Real-time operational status of security subsystems.</p>
            </div>

            {/* Overall Status Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Overall System Status</h3>
                        <p className="text-sm text-slate-500">Last updated: {new Date(systemHealth.lastUpdated).toLocaleTimeString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Refresh Status">
                        <RefreshCw size={20} />
                    </button>
                    <HealthStatusBadge status={systemHealth.overallStatus} className="px-3 py-1.5 text-sm" />
                </div>
            </div>

            {/* Component Grid */}
            <div className="grid md:grid-cols-2 gap-4">
                {systemHealth.components.map((component) => (
                    <HealthCard key={component.id} component={component} icon={getIcon(component.id)} />
                ))}
            </div>
        </div>
    );
}

function HealthCard({ component, icon: Icon }: { component: SystemComponent; icon: any }) {
    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                        <Icon size={18} />
                    </div>
                    <span className="font-medium text-slate-900">{component.name}</span>
                </div>
                <HealthStatusBadge status={component.status} showLabel={false} />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Status</span>
                    <span className="capitalize text-slate-700 font-medium">{component.status}</span>
                </div>
                {component.latency !== undefined && (
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Latency</span>
                        <span className="text-slate-700 font-mono">{component.latency}ms</span>
                    </div>
                )}
                {component.message && (
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Message</span>
                        <span className="text-slate-700 truncate max-w-[150px]" title={component.message}>{component.message}</span>
                    </div>
                )}
                <div className="border-t border-slate-100 pt-2 mt-2 flex justify-between text-xs text-slate-400">
                    <span>Last check</span>
                    <span>{new Date(component.lastCheck).toLocaleTimeString()}</span>
                </div>
            </div>
        </div>
    );
}
