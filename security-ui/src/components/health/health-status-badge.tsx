import { type LucideIcon, CheckCircle, AlertTriangle, XCircle, HelpCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import type { HealthStatus } from "../../types/security";

interface HealthStatusBadgeProps {
    status: HealthStatus;
    showLabel?: boolean;
    className?: string;
}

export function HealthStatusBadge({ status, showLabel = true, className }: HealthStatusBadgeProps) {
    const config: Record<HealthStatus, { icon: LucideIcon; color: string; label: string }> = {
        healthy: { icon: CheckCircle, color: "text-green-600 bg-green-50 border-green-200", label: "Healthy" },
        degraded: { icon: AlertTriangle, color: "text-amber-600 bg-amber-50 border-amber-200", label: "Degraded" },
        critical: { icon: XCircle, color: "text-red-600 bg-red-50 border-red-200", label: "Critical" },
        unknown: { icon: HelpCircle, color: "text-slate-500 bg-slate-50 border-slate-200", label: "Unknown" },
    };

    const { icon: Icon, color, label } = config[status];

    return (
        <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium w-fit", color, className)}>
            <Icon size={14} />
            {showLabel && <span>{label}</span>}
        </div>
    );
}
