import { describe, expect, test } from "vitest";
import { ConnectionRateLimiter } from "./gateway-rate-limiter.js";

describe("ConnectionRateLimiter", () => {
  test("allows requests up to the capacity", () => {
    const limiter = new ConnectionRateLimiter({ capacity: 3, refillPerSecond: 1 });
    // Three requests should be allowed immediately (starts full)
    expect(limiter.consume("conn-1")).toBe(true);
    expect(limiter.consume("conn-1")).toBe(true);
    expect(limiter.consume("conn-1")).toBe(true);
    // Fourth should be denied (bucket empty)
    expect(limiter.consume("conn-1")).toBe(false);
  });

  test("buckets are isolated per connection", () => {
    const limiter = new ConnectionRateLimiter({ capacity: 1, refillPerSecond: 1 });
    expect(limiter.consume("conn-a")).toBe(true);
    expect(limiter.consume("conn-a")).toBe(false);
    // conn-b has its own fresh bucket
    expect(limiter.consume("conn-b")).toBe(true);
    expect(limiter.consume("conn-b")).toBe(false);
  });

  test("delete removes the bucket, resetting it to full on next consume", () => {
    const limiter = new ConnectionRateLimiter({ capacity: 1, refillPerSecond: 1 });
    expect(limiter.consume("conn-x")).toBe(true);
    expect(limiter.consume("conn-x")).toBe(false);
    limiter.delete("conn-x");
    // After delete, a new bucket is created on next consume (starts full again)
    expect(limiter.consume("conn-x")).toBe(true);
  });

  test("getTokens returns capacity for unknown connections", () => {
    const limiter = new ConnectionRateLimiter({ capacity: 10, refillPerSecond: 10 });
    expect(limiter.getTokens("never-seen")).toBe(10);
  });

  test("tokens refill over time", async () => {
    // Use a high refill rate so we can see a token appear in a short time.
    const limiter = new ConnectionRateLimiter({ capacity: 2, refillPerSecond: 100 });
    expect(limiter.consume("conn-r")).toBe(true);
    expect(limiter.consume("conn-r")).toBe(true);
    expect(limiter.consume("conn-r")).toBe(false);
    // Wait 20ms — at 100 tokens/sec that should refill ~2 tokens
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(limiter.consume("conn-r")).toBe(true);
  });
});
