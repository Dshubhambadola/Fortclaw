import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { cn } from "../../lib/utils";

export function SecurityScoreWidget({ score }: { score: number }) {
    const data = [
        { value: score },
        { value: 100 - score },
    ];

    // Color based on score
    const color = score >= 90 ? "#10b981" : score >= 70 ? "#eab308" : "#ef4444";

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <h3 className="text-slate-500 font-medium text-sm mb-2">Security Score</h3>
            <div className="relative w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={55}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={5}
                        >
                            <Cell fill={color} />
                            <Cell fill="#f1f5f9" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-800">{score}</span>
                    <span className="text-xs text-slate-400">/ 100</span>
                </div>
            </div>
            <div className={cn("mt-2 text-sm font-medium px-3 py-1 rounded-full",
                score >= 90 ? "bg-emerald-50 text-emerald-600" :
                    score >= 70 ? "bg-yellow-50 text-yellow-600" :
                        "bg-red-50 text-red-600"
            )}>
                {score >= 90 ? "Excellent" : score >= 70 ? "Good" : "Needs Attention"}
            </div>
        </div>
    );
}
