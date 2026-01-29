import { describe, expect, it } from "vitest";
import { resolveTrustLevelPolicy, TOOL_CATEGORIES } from "./trust-levels.js";

describe("Trust Levels", () => {
  it("L1 allows only safe tools", () => {
    const policy = resolveTrustLevelPolicy("L1");
    expect(policy.allow).toEqual(TOOL_CATEGORIES.safe);
    expect(policy.deny).toContain("*");
  });

  it("L2 allows safe and sensitive tools", () => {
    const policy = resolveTrustLevelPolicy("L2");
    expect(policy.allow).toEqual(
      expect.arrayContaining([...TOOL_CATEGORIES.safe, ...TOOL_CATEGORIES.sensitive]),
    );
    expect(policy.deny).toEqual(TOOL_CATEGORIES.dangerous);
  });

  it("L3 allows all but restricted", () => {
    const policy = resolveTrustLevelPolicy("L3");
    expect(policy.allow).toContain("*");
    expect(policy.deny).toContain("elevated");
  });
});
