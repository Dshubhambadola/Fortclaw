import { Shield, Hammer, Lock, Settings } from "lucide-react";
import type { SecurityProfile } from "../../types/security";
import { cn } from "../../lib/utils";

const labels: Record<SecurityProfile, string> = {
    development: "Development",
    personal: "Personal",
    production: "Production",
    custom: "Custom",
};

const icons = {
    development: Hammer,
    personal: Shield,
    production: Lock,
    custom: Settings,
};

const colors = {
    development: "bg-blue-50 text-blue-600 border-blue-200",
    personal: "bg-purple-50 text-purple-600 border-purple-200",
    production: "bg-emerald-50 text-emerald-600 border-emerald-200",
    custom: "bg-slate-50 text-slate-600 border-slate-200",
};

export function ActiveProfileBadge({ profile }: { profile: SecurityProfile }) {
    const Icon = icons[profile];
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-start justify-between">
            <h3 className="text-slate-500 font-medium text-sm mb-4">Active Profile</h3>
            <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-lg border", colors[profile])}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <div className="font-bold text-lg text-slate-800 capitalize">{labels[profile]}</div>
                    <div className="text-xs text-slate-500">
                        {profile === "development" && "Low security, high convenience"}
                        {profile === "personal" && "Balanced security & usability"}
                        {profile === "production" && "Maximum isolation & auditing"}
                    </div>
                </div>
            </div>
        </div>
    );
}
