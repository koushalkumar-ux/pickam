import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private configService: ConfigService) { }

  onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL');

    if (!redisUrl) {
      throw new Error('❌ REDIS_URL is not defined in environment variables');
    }

    this.client = new Redis(redisUrl, {
      tls: redisUrl.startsWith('rediss://') ? {} : undefined,
    });

    this.client.on('connect', () => {
      console.log('✅ Redis Connected');
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis Client Error FULL:', err);
    });
  }


  onModuleDestroy() {
    this.client.disconnect();
  }



  /**
   * Token Bucket Logic in Lua
   * ARGV[1]: capacity, ARGV[2]: refillRate (tokens/ms), ARGV[3]: now (ms)
   */
  async consume(key: string, capacity: number, refillRate: number): Promise<{
    allowed: boolean; remaining: number; elapsed: number; refill: number;
  }> {
    const script = `
                  local key = KEYS[1]

local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2]) -- tokens per ms
local now = tonumber(ARGV[3])

-- Get stored values
local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')
local tokens = tonumber(bucket[1])
local last_refill = tonumber(bucket[2])

-- Initialize if first request
if not tokens then
  tokens = capacity
  last_refill = now
end

-- Calculate elapsed time
local elapsed = math.max(0, now - last_refill)

-- Calculate refill
local refill = elapsed * refill_rate

-- Add refill to tokens
tokens = math.min(capacity, tokens + refill)

-- Update timestamp (IMPORTANT)
last_refill = now

local allowed = 0

-- Consume token if available
if tokens >= 1 then
  tokens = tokens - 1
  allowed = 1
end

-- Persist updated state
redis.call('HMSET', key, 'tokens', tokens, 'last_refill', last_refill)

-- Set expiry (auto cleanup)
redis.call('PEXPIRE', key, math.ceil(capacity / refill_rate))

-- Return full debug info
return {allowed, tokens, elapsed, refill}
    `;

    const [allowed, remaining, elapsed, refill] =
      await this.client.eval(
        script,
        1,
        key,
        capacity,
        refillRate,
        Date.now()
      ) as [number, number, number, number];

    return {
      allowed: allowed === 1,
      remaining,
      elapsed,
      refill,
    };

  }
}