import { Outlet, NavLink } from "react-router-dom";
import { Shield, LayoutDashboard, CheckCircle, FileText, Settings, Activity } from "lucide-react";
import { cn } from "../lib/utils";

export function DashboardLayout() {
    return (
        <div className="flex h-screen bg-slate-50 text-slate-900">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col">
                <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                    <Shield className="w-8 h-8 text-emerald-400" />
                    <span className="font-bold text-lg tracking-tight text-white">Fortclaw</span>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Overview" />
                    <NavItem to="/approvals" icon={<CheckCircle size={20} />} label="Approvals" />
                    <NavItem to="/audit-logs" icon={<FileText size={20} />} label="Audit Logs" />
                    <NavItem to="/health" icon={<Activity size={20} />} label="Health" />
                    <NavItem to="/config" icon={<Settings size={20} />} label="Settings" />
                </nav>

                <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
                    v1.0.0 Alpha
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shadow-sm justify-between">
                    <h1 className="text-xl font-semibold text-slate-800">Security Control Panel</h1>
                    {/* Profile Switcher Placeholder */}
                    <div className="text-sm text-slate-500">Profile: Personal</div>
                </header>

                <div className="flex-1 overflow-auto p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    isActive
                        ? "bg-emerald-500/10 text-emerald-400 font-medium"
                        : "hover:bg-slate-800 hover:text-white"
                )
            }
        >
            {icon}
            <span>{label}</span>
        </NavLink>
    );
}
