import { describe, it, expect } from "vitest";
import { NetworkFilter } from "./network-filter.js";

describe("NetworkFilter", () => {
  it("allows all traffic when egressFiltering is disabled", () => {
    const filter = new NetworkFilter({ egressFiltering: false });
    expect(filter.validate("https://google.com").allowed).toBe(true);
    expect(filter.validate("https://evil.part").allowed).toBe(true);
  });

  describe("Allowlist Mode", () => {
    const filter = new NetworkFilter({
      egressFiltering: true,
      allowedDomains: ["google.com", "*.github.com"],
      defaultDeny: true, // implicit usually, but explicit here for clarity
    });

    it("allows exact matches", () => {
      expect(filter.validate("https://google.com").allowed).toBe(true);
      expect(filter.validate("https://google.com/search").allowed).toBe(true);
    });

    it("allows wildcard subdomains", () => {
      expect(filter.validate("https://api.github.com").allowed).toBe(true);
      expect(filter.validate("https://raw.github.com").allowed).toBe(true);
      expect(filter.validate("https://github.com").allowed).toBe(true); // "github.com" matches "*.github.com" as suffix? Logic needs check.
    });

    it("blocks non-matching domains", () => {
      expect(filter.validate("https://example.com").allowed).toBe(false);
      expect(filter.validate("https://evil.google.com").allowed).toBe(false); // "google.com" exact match shouldn't match subdomain.
    });

    it("handles invalid URLs gracefully", () => {
      // Should attempt to prepend https://
      // "google.com" -> valid
      expect(filter.validate("google.com").allowed).toBe(true);
      // "example.com" -> blocked
      expect(filter.validate("example.com").allowed).toBe(false);
    });
  });

  describe("Wildcard Behaviors", () => {
    it("handles * correctly", () => {
      const filter = new NetworkFilter({ egressFiltering: true, allowedDomains: ["*"] });
      expect(filter.validate("https://anything.com").allowed).toBe(true);
    });
  });
});
