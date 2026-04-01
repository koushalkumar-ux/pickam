import { SetMetadata } from '@nestjs/common';

export interface RateLimitOptions {
  capacity: number;     // Max tokens in bucket
  refillRate: number;   // Tokens added per millisecond (e.g., 1/1000 = 1 token per sec)
}

export const RATE_LIMIT_KEY = 'rate_limit';
export const RateLimit = (options: RateLimitOptions) => SetMetadata(RATE_LIMIT_KEY, options);