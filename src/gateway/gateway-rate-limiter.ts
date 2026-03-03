/**
 * Per-connection token-bucket rate limiter.
 *
 * Each connection starts with `capacity` tokens. Tokens refill at
 * `refillPerSecond` per second up to the capacity ceiling (lazy refill:
 * calculated at consume-time, no interval needed).
 *
 * Designed to be instantiated once per gateway server instance and shared
 * across all connections.
 */

export type RateLimiterConfig = {
  /** Maximum burst capacity (tokens per connection). Default: 60 */
  capacity?: number;
  /** Token refill rate (tokens per second). Default: 60 */
  refillPerSecond?: number;
};

type Bucket = {
  tokens: number;
  lastRefillMs: number;
};

export class ConnectionRateLimiter {
  private buckets = new Map<string, Bucket>();
  private readonly capacity: number;
  private readonly refillPerSecond: number;

  constructor(config: RateLimiterConfig = {}) {
    this.capacity = config.capacity ?? 60;
    this.refillPerSecond = config.refillPerSecond ?? 60;
  }

  /**
   * Consume one token for the given connection.
   * Returns `true` if allowed, `false` if rate limit exceeded.
   */
  consume(connId: string): boolean {
    const now = Date.now();
    let bucket = this.buckets.get(connId);

    if (!bucket) {
      bucket = { tokens: this.capacity, lastRefillMs: now };
      this.buckets.set(connId, bucket);
    }

    // Lazy refill: calculate tokens earned since last consume
    const elapsedSec = (now - bucket.lastRefillMs) / 1000;
    const earned = elapsedSec * this.refillPerSecond;
    bucket.tokens = Math.min(this.capacity, bucket.tokens + earned);
    bucket.lastRefillMs = now;

    if (bucket.tokens < 1) {
      return false;
    }

    bucket.tokens -= 1;
    return true;
  }

  /**
   * Remove the bucket for a connection that has closed.
   * Should be called on every connection close to prevent memory leaks.
   */
  delete(connId: string): void {
    this.buckets.delete(connId);
  }

  /** Returns current bucket size (for testing/observability). */
  getTokens(connId: string): number {
    return this.buckets.get(connId)?.tokens ?? this.capacity;
  }
}
