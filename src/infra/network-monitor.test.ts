import { describe, it, expect } from "vitest";
import { NetworkMonitor } from "./network-monitor.js";
import { SecurityConfig } from "../config/security-profiles.js";

describe("NetworkMonitor", () => {
  const baseConfig: SecurityConfig["network"] = {
    egressFiltering: true,
    monitoring: true,
    rateLimiting: true,
    anomalyDetection: true,
    maxRequestsPerMinute: 10,
    maxRequestsPerSecond: 5,
    allowedPorts: [80, 443],
  };

  it("allows standard requests", () => {
    const monitor = new NetworkMonitor();
    const res = monitor.check("agent-1", "https://google.com", baseConfig);
    expect(res.allowed).toBe(true);
  });

  it("blocks disallowed ports", () => {
    const monitor = new NetworkMonitor();
    const res = monitor.check("agent-1", "http://example.com:8080", baseConfig);
    expect(res.allowed).toBe(false);
    expect(res.type).toBe("port_violation");
  });

  it("allows customized allowed ports", () => {
    const monitor = new NetworkMonitor();
    const customConfig = { ...baseConfig, allowedPorts: [8080] };
    const res = monitor.check("agent-1", "http://example.com:8080", customConfig);
    expect(res.allowed).toBe(true);
  });

  it("enforces rate limits per minute", () => {
    const monitor = new NetworkMonitor();
    const config = { ...baseConfig, maxRequestsPerMinute: 2 };

    expect(monitor.check("agent-1", "https://google.com", config).allowed).toBe(true);
    expect(monitor.check("agent-1", "https://google.com", config).allowed).toBe(true);

    const res = monitor.check("agent-1", "https://google.com", config);
    expect(res.allowed).toBe(false);
    expect(res.type).toBe("rate_limit");

    // Other agents are unaffected
    expect(monitor.check("agent-2", "https://google.com", config).allowed).toBe(true);
  });

  it("enforces burst limits", () => {
    const monitor = new NetworkMonitor();
    // Burst limit of 2 requests per second
    const config = { ...baseConfig, maxRequestsPerSecond: 2 };

    expect(monitor.check("agent-burst", "https://google.com", config).allowed).toBe(true);
    expect(monitor.check("agent-burst", "https://google.com", config).allowed).toBe(true);

    const res = monitor.check("agent-burst", "https://google.com", config);
    expect(res.allowed).toBe(false);
    expect(res.type).toBe("burst_limit");
  });
});
