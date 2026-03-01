import { useState } from "react";
import { useSecurityStore } from "../store/security-store";
import { AuditLogTable } from "../components/audit/audit-log-table";
import { AuditFilters } from "../components/audit/audit-filters";

export function AuditLogPage() {
    const { recentActivity } = useSecurityStore();
    const [search, setSearch] = useState("");
    const [severityFilter, setSeverityFilter] = useState("all");

    // Start with data from store, sorted by newest
    const filteredLogs = recentActivity
        .filter(log => {
            const matchesSearch =
                log.action.toLowerCase().includes(search.toLowerCase()) ||
                log.actor.toLowerCase().includes(search.toLowerCase()) ||
                log.resource.toLowerCase().includes(search.toLowerCase());

            const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;

            return matchesSearch && matchesSeverity;
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Audit Logs</h2>
                <p className="text-slate-500 text-sm mt-1">Review system activity, security events, and agent operations.</p>
            </div>

            <AuditFilters
                onSearchChange={setSearch}
                onSeverityChange={setSeverityFilter}
            />

            <AuditLogTable logs={filteredLogs} />

            <div className="text-center text-xs text-slate-400">
                Showing {filteredLogs.length} of {recentActivity.length} events
            </div>
        </div>
    );
}
