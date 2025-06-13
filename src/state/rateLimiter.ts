// =====================================================
// ENTERPRISE RATE LIMITING SYSTEM
// =====================================================

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (operation: string) => string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();

  constructor() {
    // Default rate limit configurations
    this.setConfig('supabase-query', { maxRequests: 100, windowMs: 60000 }); // 100 requests per minute
    this.setConfig('system-metrics', { maxRequests: 20, windowMs: 60000 }); // 20 requests per minute
    this.setConfig('database-stats', { maxRequests: 10, windowMs: 60000 }); // 10 requests per minute
    this.setConfig('real-time-updates', { maxRequests: 60, windowMs: 60000 }); // 60 requests per minute
    this.setConfig('auth-operations', { maxRequests: 5, windowMs: 60000 }); // 5 requests per minute
    this.setConfig('project-operations', { maxRequests: 30, windowMs: 60000 }); // 30 requests per minute
  }

  setConfig(operation: string, config: RateLimitConfig): void {
    this.configs.set(operation, config);
  }

  async checkLimit(operation: string, key?: string): Promise<boolean> {
    const config = this.configs.get(operation);
    if (!config) {
      console.warn(`No rate limit config found for operation: ${operation}`);
      return true; // Allow if no config
    }

    const limitKey = key || operation;
    const now = Date.now();
    const entry = this.limits.get(limitKey);

    // Clean up expired entries
    if (entry && now > entry.resetTime) {
      this.limits.delete(limitKey);
    }

    const currentEntry = this.limits.get(limitKey);
    
    if (!currentEntry) {
      // First request in window
      this.limits.set(limitKey, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return true;
    }

    if (currentEntry.count >= config.maxRequests) {
      console.warn(`Rate limit exceeded for operation: ${operation}, key: ${limitKey}`);
      return false;
    }

    // Increment count
    currentEntry.count++;
    return true;
  }

  getRemainingRequests(operation: string, key?: string): number {
    const config = this.configs.get(operation);
    if (!config) return Infinity;

    const limitKey = key || operation;
    const entry = this.limits.get(limitKey);
    
    if (!entry || Date.now() > entry.resetTime) {
      return config.maxRequests;
    }

    return Math.max(0, config.maxRequests - entry.count);
  }

  getResetTime(operation: string, key?: string): number {
    const limitKey = key || operation;
    const entry = this.limits.get(limitKey);
    return entry?.resetTime || 0;
  }

  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  rateLimiter.cleanup();
}, 5 * 60 * 1000);

// Rate limiting decorator for async functions
export function withRateLimit<T extends any[], R>(
  operation: string,
  fn: (...args: T) => Promise<R>,
  keyGenerator?: (...args: T) => string
) {
  return async (...args: T): Promise<R> => {
    const key = keyGenerator ? keyGenerator(...args) : undefined;
    const allowed = await rateLimiter.checkLimit(operation, key);
    
    if (!allowed) {
      const resetTime = rateLimiter.getResetTime(operation, key);
      const waitTime = Math.max(0, resetTime - Date.now());
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds.`);
    }

    return fn(...args);
  };
}

// Utility function to create rate-limited API calls
export function createRateLimitedCall<T extends any[], R>(
  operation: string,
  fn: (...args: T) => Promise<R>,
  options?: {
    keyGenerator?: (...args: T) => string;
    retryOnLimit?: boolean;
    maxRetries?: number;
  }
) {
  const { keyGenerator, retryOnLimit = false, maxRetries = 3 } = options || {};
  
  return async (...args: T): Promise<R> => {
    let retries = 0;
    
    while (retries <= maxRetries) {
      try {
        const key = keyGenerator ? keyGenerator(...args) : undefined;
        const allowed = await rateLimiter.checkLimit(operation, key);
        
        if (!allowed) {
          if (!retryOnLimit || retries >= maxRetries) {
            const resetTime = rateLimiter.getResetTime(operation, key);
            const waitTime = Math.max(0, resetTime - Date.now());
            throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds.`);
          }
          
          // Wait and retry
          const resetTime = rateLimiter.getResetTime(operation, key);
          const waitTime = Math.min(5000, Math.max(1000, resetTime - Date.now())); // Wait max 5 seconds
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retries++;
          continue;
        }

        return await fn(...args);
      } catch (error) {
        if (retries >= maxRetries || !retryOnLimit) {
          throw error;
        }
        retries++;
        await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
      }
    }
    
    throw new Error(`Max retries exceeded for operation: ${operation}`);
  };
}