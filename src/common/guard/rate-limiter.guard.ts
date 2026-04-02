import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../../infrastructure/redis/service/redis.service';
import { RATE_LIMIT_KEY, RateLimitOptions } from '../decorators/rate-limit.decorator';

@Injectable()
export class RateLimiterGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private redisService: RedisService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!options) return true;

    const request = context.switchToHttp().getRequest();

    const identifier = request.user?.sub || request.ip;
    const route = request.route.path;

    const key = `ratelimit:${route}:${identifier}`;

    const start = Date.now();

    const { allowed, remaining, elapsed, refill } =
      await this.redisService.consume(
        key,
        options.capacity,
        options.refillRate,
      );

    const duration = Date.now() - start;

    // 🔥 FULL DEBUG LOG
//     console.log(`
// [RateLimit]
// Key        : ${key}
// Allowed    : ${allowed}
// Remaining  : ${remaining} tokens
// Refilled   : ${refill} tokens
// Elapsed    : ${elapsed} ms
// Capacity   : ${options.capacity}
// RefillRate : ${options.refillRate}
// Exec Time  : ${duration} ms
// -----------------------------------
//     `);

    if (!allowed) {
      throw new HttpException(
        {
          message: 'Too Many Requests',
          remaining: Number(remaining.toFixed(3)),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}