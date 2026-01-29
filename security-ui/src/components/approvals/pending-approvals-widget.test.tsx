import { render, screen } from "@testing-library/react";
import { PendingApprovalsWidget } from "./pending-approvals-widget";
import type { ApprovalRequest } from "../../types/security";

const mockReq: ApprovalRequest = {
    id: "1",
    agent: "agent-x",
    tool: "exec",
    operation: { cmd: "ls" },
    risk: "high",
    context: "test context",
    expiresAt: new Date().toISOString()
};

describe("PendingApprovalsWidget", () => {
    it("renders empty state when no requests", () => {
        render(<PendingApprovalsWidget requests={[]} />);
        expect(screen.getByText("No Pending Approvals")).toBeInTheDocument();
    });

    it("renders list of requests", () => {
        render(<PendingApprovalsWidget requests={[mockReq]} />);
        expect(screen.getByText("1 Active")).toBeInTheDocument();
        expect(screen.getByText("exec")).toBeInTheDocument();
        expect(screen.getByText("test context")).toBeInTheDocument();
        expect(screen.getByText("high")).toBeInTheDocument();
    });
});
