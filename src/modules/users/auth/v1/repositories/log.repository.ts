import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Log } from '../schemas/log.schema';

@Injectable()
export class LogRepository {
  constructor(
    @InjectModel(Log.name) private logModel: Model<Log>,
  ) {}

  async create(data: Partial<Log>): Promise<Log> {
    const newLog = new this.logModel(data);
    return newLog.save();
  }
}