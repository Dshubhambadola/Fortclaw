import type { Recommendation } from "../../types/security";
import { Lightbulb, ArrowRight, X } from "lucide-react";

export function RecommendationsPanel({ recommendations }: { recommendations: Recommendation[] }) {
    if (recommendations.length === 0) return null;

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100 shadow-sm col-span-2">
            <div className="flex items-center gap-2 mb-4 text-indigo-900">
                <Lightbulb className="text-indigo-600 fill-indigo-200" size={20} />
                <h3 className="font-medium">Security Recommendations</h3>
            </div>

            <div className="space-y-3">
                {recommendations.map((rec) => (
                    <div key={rec.id} className="bg-white/80 p-4 rounded-lg flex items-start justify-between gap-4 border border-indigo-100">
                        <div>
                            <h4 className="font-medium text-slate-800 text-sm">{rec.title}</h4>
                            <p className="text-xs text-slate-500 mt-1">{rec.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="text-xs font-medium bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-1">
                                {rec.actionLabel}
                                <ArrowRight size={12} />
                            </button>
                            <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100">
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
