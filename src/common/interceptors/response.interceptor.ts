import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const i18n = I18nContext.current(context);
    return next.handle().pipe(
      map((payload) => {
        const messageKey = payload?.message || 'common.REQUEST_SUCCESS';
        const message = i18n ? i18n.t(messageKey) : messageKey;
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