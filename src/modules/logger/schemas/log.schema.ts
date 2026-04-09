import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Log extends Document {
  @Prop({ required: true })
  level: string; // info, error, warn, debug

  @Prop({ required: true })
  module: string; // e.g., 'AuthModule', 'UserModule'

  @Prop({ required: true })
  message: string;

  @Prop({ type: Object })
  metadata: any; // Extra data like stack traces or request IDs

  @Prop()
  context: string; // Specific class or method name
}

export const LogSchema = SchemaFactory.createForClass(Log);
LogSchema.index({ module: 1, level: 1 });
LogSchema.index({ createdAt: -1 });