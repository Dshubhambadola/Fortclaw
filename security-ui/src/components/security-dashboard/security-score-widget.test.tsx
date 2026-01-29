import { render, screen } from "@testing-library/react";
import { SecurityScoreWidget } from "./security-score-widget";

describe("SecurityScoreWidget", () => {
    it("renders the score correctly", () => {
        render(<SecurityScoreWidget score={85} />);
        expect(screen.getByText("85")).toBeInTheDocument();
        expect(screen.getByText("Good")).toBeInTheDocument();
    });

    it("displays 'Excellent' for high scores", () => {
        render(<SecurityScoreWidget score={95} />);
        expect(screen.getByText("Excellent")).toBeInTheDocument();
    });

    it("displays 'Needs Attention' for low scores", () => {
        render(<SecurityScoreWidget score={50} />);
        expect(screen.getByText("Needs Attention")).toBeInTheDocument();
    });
});
