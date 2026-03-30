import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const i18n = I18nContext.current(host);

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: string[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const res: any = exceptionResponse;

        // ✅ Handle validation errors (array)
        if (Array.isArray(res.message)) {
          message = 'common.VALIDATION_FAILED';
          errors = res.message.map((msg: string) => (i18n ? i18n.t(msg) : msg));
        } else {
          message = res.message || exception.message;
        }
      }
    }

    const finalMessage = i18n ? i18n.t(message) : message;

    response.status(status).json({
      success: false,
      message: finalMessage,
      errors,
      data: null,
    });
  }
}