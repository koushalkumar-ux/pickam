import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { LogRepository } from '../../../modules/users/auth/v1/repositories/log.repository';

@Injectable({ scope: Scope.TRANSIENT })
export class DbLoggerService implements LoggerService {
  private module: string = 'DefaultModule';

  constructor(private readonly logRepository: LogRepository) {}

  setModule(moduleName: string) {
    this.module = moduleName;
  }

  log(message: any, context?: string) {
    this.persist('info', message, context);
  }

  error(message: any, trace?: string, context?: string) {
    this.persist('error', message, context, { trace });
  }

  warn(message: any, context?: string) {
    this.persist('warn', message, context);
  }

  debug(message: any, context?: string) {
    this.persist('debug', message, context);
  }

  private persist(level: string, message: any, context?: string, metadata?: any) {
    // Log to console for real-time visibility
    console[level === 'info' ? 'log' : level](`[${this.module}] [${context || ''}] ${message}`);

    this.logRepository.create({
      level,
      module: this.module,
      message: typeof message === 'string' ? message : JSON.stringify(message),
      context,
      metadata,
    }).catch(err => console.error('Failed to save log to DB:', err));
  }
}