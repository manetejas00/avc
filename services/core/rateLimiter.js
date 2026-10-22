/**
 * In-memory sliding window rate limiter for external financial API quotas.
 */
export class SlidingWindowRateLimiter {
  constructor() {
    this.windows = new Map();
  }

  /**
   * Check if a request is allowed within the provider's rate limit window.
   * @param {string} provider 
   * @param {number} maxRequests 
   * @param {number} windowMs 
   * @returns {boolean}
   */
  canExecute(provider, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const timestamps = this.windows.get(provider) || [];
    const validTimestamps = timestamps.filter(ts => now - ts < windowMs);
    
    if (validTimestamps.length >= maxRequests) {
      this.windows.set(provider, validTimestamps);
      return false;
    }

    validTimestamps.push(now);
    this.windows.set(provider, validTimestamps);
    return true;
  }

  /**
   * Reset rate limit window for a provider.
   * @param {string} provider 
   */
  reset(provider) {
    this.windows.delete(provider);
  }
}

export const rateLimiter = new SlidingWindowRateLimiter();
