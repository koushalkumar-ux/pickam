import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((payload) => {
        const message = payload?.message || 'Request successful';
        let data = payload?.data ?? payload;

        // If the message was at the root of the service return, 
        // remove it from the 'data' part of the final response
        if (payload?.message && !payload?.data && typeof data === 'object' && data !== null) {
          const { message: _ignored, ...remainingData } = data;
          data = remainingData;
        }

        return {
          success: true,
          message,
          data,
        };
      }),
    );
  }
}