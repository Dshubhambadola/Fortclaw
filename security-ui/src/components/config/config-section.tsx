import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

interface ConfigSectionProps {
    title: string;
    description: string;
    icon: LucideIcon;
    children: ReactNode;
    isEnabled?: boolean;
    onToggle?: () => void;
}

export function ConfigSection({ title, description, icon: Icon, children, isEnabled, onToggle }: ConfigSectionProps) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition-all hover:shadow-md">
            <div className="p-6 flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex gap-4">
                    <div className={cn("p-2 rounded-lg h-fit", isEnabled ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500")}>
                        <Icon size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">{title}</h3>
                        <p className="text-sm text-slate-500 mt-1">{description}</p>
                    </div>
                </div>
                {onToggle && (
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={isEnabled} onChange={onToggle} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                )}
            </div>
            <div className={cn("p-6", !isEnabled && onToggle && "opacity-50 pointer-events-none grayscale-[0.5]")}>
                {children}
            </div>
        </div>
    );
}
