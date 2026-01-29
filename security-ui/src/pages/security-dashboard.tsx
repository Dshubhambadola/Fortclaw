import { useSecurityStore } from "../store/security-store";
import { ActiveProfileBadge } from "../components/security-dashboard/active-profile-badge";
import { RecentActivityFeed } from "../components/security-dashboard/recent-activity-feed";
import { RecommendationsPanel } from "../components/security-dashboard/recommendations-panel";
import { SecurityScoreWidget } from "../components/security-dashboard/security-score-widget";
import { SecurityStatusPanel } from "../components/security-dashboard/security-status-panel";
import { PendingApprovalsWidget } from "../components/approvals/pending-approvals-widget";

export function SecurityDashboard() {
    const { score, profile, status, recentActivity, pendingApprovals } = useSecurityStore();

    // Mock recommendations (could be in store too)
    const recommendations = [
        {
            id: "rec_1",
            title: "Enable Network Egress Filtering",
            description: "Your current profile allows unrestricted outbound network access.",
            severity: "high" as const,
            actionLabel: "Enable",
            actionId: "enable_network",
        }
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Top Row Stats */}
            <SecurityScoreWidget score={score} />
            <ActiveProfileBadge profile={profile} />
            <SecurityStatusPanel status={status} />

            {/* Recommendations & Pending */}
            <div className="lg:col-span-2">
                <RecommendationsPanel recommendations={recommendations} />
            </div>
            <div>
                <PendingApprovalsWidget requests={pendingApprovals} />
            </div>

            {/* Main Feed */}
            <div className="lg:col-span-3">
                <RecentActivityFeed activities={recentActivity} />
            </div>
        </div>
    );
}
