import { useSecurityStore } from "../store/security-store";
import { ConfigSection } from "../components/config/config-section";
import { Shield, Lock, UserCheck, Eye, Network } from "lucide-react";
import type { SecurityStatus } from "../types/security";

export function SecurityConfigPage() {
    const { status, updateStatus } = useSecurityStore();

    const handleToggle = (key: Exclude<keyof SecurityStatus, 'network'>) => {
        const current = status[key];
        updateStatus({
            [key]: { ...current, enabled: !current.enabled }
        });
    };

    const handleChange = (key: keyof SecurityStatus, field: string, value: any) => {
        updateStatus({
            [key]: { ...status[key], [field]: value }
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Security Configuration</h2>
                <p className="text-slate-500 text-sm mt-1">Manage global security policies and agent restrictions.</p>
            </div>

            <div className="grid gap-6">
                {/* Sandbox Configuration */}
                <ConfigSection
                    title="Execution Sandbox"
                    description="Isolate agent code execution in secure environments."
                    icon={Shield}
                    isEnabled={status.sandbox.enabled}
                    onToggle={() => handleToggle("sandbox")}
                >
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Sandbox Mode</label>
                            <select
                                value={status.sandbox.mode}
                                onChange={(e) => handleChange("sandbox", "mode", e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            >
                                <option value="off">Off (Dry Run)</option>
                                <option value="non-main">Non-Main Branch Only</option>
                                <option value="all">Always Enforce</option>
                            </select>
                            <p className="text-xs text-slate-400 mt-2">
                                "Always Enforce" runs all agent code changes in ephemeral containers.
                            </p>
                        </div>
                    </div>
                </ConfigSection>

                {/* Input Validation */}
                <ConfigSection
                    title="Input Validation"
                    description="Sanitize and validate all incoming prompts and data."
                    icon={Lock}
                    isEnabled={status.inputValidation.enabled}
                    onToggle={() => handleToggle("inputValidation")}
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Strictness Level</label>
                            <div className="grid grid-cols-3 gap-2">
                                {["low", "medium", "high"].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => handleChange("inputValidation", "strictness", level)}
                                        className={cn(
                                            "px-3 py-2 rounded-lg text-sm font-medium border capitalize transition-all",
                                            status.inputValidation.strictness === level
                                                ? "bg-indigo-50 border-indigo-200 text-indigo-700 ring-2 ring-indigo-500/20"
                                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                        )}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <p className="text-xs text-slate-500">
                            High strictness may block some complex but valid engineer prompts.
                        </p>
                    </div>
                </ConfigSection>

                {/* Human Approval */}
                <ConfigSection
                    title="Human Approval"
                    description="Require manual confirmation for sensitive actions."
                    icon={UserCheck}
                    isEnabled={status.humanApproval.enabled}
                    onToggle={() => handleToggle("humanApproval")}
                >
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Require For</label>
                        <select
                            value={typeof status.humanApproval.requireFor === 'string' ? status.humanApproval.requireFor : 'custom'}
                            onChange={(e) => handleChange("humanApproval", "requireFor", e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        >
                            <option value="all">All Actions</option>
                            <option value="exec">Shell Execution & File Writes</option>
                            <option value="custom">Custom Policy</option>
                        </select>
                    </div>
                </ConfigSection>

                {/* Audit Logging */}
                <ConfigSection
                    title="Audit Logging"
                    description="Retention policies for security event logs."
                    icon={Eye}
                    isEnabled={status.audit.enabled}
                    onToggle={() => handleToggle("audit")}
                >
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Log Retention (Days)</label>
                        <input
                            type="number"
                            value={status.audit.retention}
                            onChange={(e) => handleChange("audit", "retention", parseInt(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            min={1}
                            max={365}
                        />
                    </div>
                </ConfigSection>

                {/* Network Security */}
                <ConfigSection
                    title="Network Security"
                    description="Control egress traffic and monitor for anomalies."
                    icon={Network}
                    isEnabled={true} // Always show controls
                >
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div>
                                <span className="text-sm font-medium text-slate-900 block">Egress Filtering</span>
                                <span className="text-xs text-slate-500">Block outbound connections to unknown hosts</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={status.network.egressFiltering}
                                    onChange={(e) => handleChange("network", "egressFiltering", e.target.checked)}
                                />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div>
                                <span className="text-sm font-medium text-slate-900 block">Anomaly Detection</span>
                                <span className="text-xs text-slate-500">ML-based detection of unusual traffic patterns</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={status.network.anomalyDetection}
                                    onChange={(e) => handleChange("network", "anomalyDetection", e.target.checked)}
                                />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                        </div>
                    </div>
                </ConfigSection>

            </div>
        </div>
    );
}

// Helper for conditional classes
function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}
