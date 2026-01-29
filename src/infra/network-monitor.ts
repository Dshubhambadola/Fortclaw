import { SecurityConfig } from "../config/security-profiles.js";

type MonitorResult = {
  allowed: boolean;
  reason?: string;
  type?: "rate_limit" | "port_violation" | "burst_limit";
};

type AgentTrafficState = {
  requests: number[]; // Timestamps of recent requests
};

export class NetworkMonitor {
  private traffic = new Map<string, AgentTrafficState>();

  /**
   * Records a request and checks for anomalies.
   * Returns validation result.
   */
  check(agentId: string, url: string, config: SecurityConfig["network"]): MonitorResult {
    // 1. Check Port
    if (config.allowedPorts && config.allowedPorts.length > 0) {
      const port = this.resolvePort(url);
      if (port && !config.allowedPorts.includes(port)) {
        return {
          allowed: false,
          reason: `Port ${port} is not allowed by network security policy. Allowed ports: ${config.allowedPorts.join(", ")}`,
          type: "port_violation",
        };
      }
    }

    // 2. Rate Limiting logic
    if (config.rateLimiting) {
      const state = this.getAgentState(agentId);
      const now = Date.now();
      const oneMinuteAgo = now - 60000;
      const oneSecondAgo = now - 1000;

      // Prune old requests
      state.requests = state.requests.filter((t) => t > oneMinuteAgo);

      // Check Requests Per Minute
      if (config.maxRequestsPerMinute && state.requests.length >= config.maxRequestsPerMinute) {
        return {
          allowed: false,
          reason: `Rate limit exceeded. Max ${config.maxRequestsPerMinute} requests per minute.`,
          type: "rate_limit",
        };
      }

      // Check Requests Per Second (Burst)
      if (config.anomalyDetection && config.maxRequestsPerSecond) {
        const recentBurst = state.requests.filter((t) => t > oneSecondAgo).length;
        if (recentBurst >= config.maxRequestsPerSecond) {
          return {
            allowed: false,
            reason: `Burst limit exceeded. Max ${config.maxRequestsPerSecond} requests per second.`,
            type: "burst_limit",
          };
        }
      }

      // Record this request
      state.requests.push(now);
    }

    return { allowed: true };
  }

  private getAgentState(agentId: string): AgentTrafficState {
    if (!this.traffic.has(agentId)) {
      this.traffic.set(agentId, { requests: [] });
    }
    return this.traffic.get(agentId)!;
  }

  private resolvePort(urlStr: string): number | null {
    try {
      const u = new URL(urlStr);
      if (u.port) {
        return parseInt(u.port, 10);
      }
      if (u.protocol === "http:") return 80;
      if (u.protocol === "https:") return 443;
      return null;
    } catch {
      return null;
    }
  }
}

export const networkMonitor = new NetworkMonitor();
