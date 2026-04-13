import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DbLoggerService } from './services/db-logger.service';
import { LogRepository } from '../../modules/users/auth/v1/repositories/log.repository';
import { Log, LogSchema } from '../../modules/users/auth/v1/schemas/log.schema';

@Global()
@Module({
  imports: [
    // Register the Log schema so LogRepository can inject the Model
    MongooseModule.forFeature([{ name: Log.name, schema: LogSchema }]),
  ],
  providers: [DbLoggerService, LogRepository],
  exports: [DbLoggerService], // Export so other modules can use it
})
export class LoggerModule {}