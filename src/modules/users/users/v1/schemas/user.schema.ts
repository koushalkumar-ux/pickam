// Example of what needs to be added to your User class/schema
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

class PasswordHistoryEntry {
  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  changedAt: Date;
}

class BanInfo {
  @Prop({ required: true })
  reasonCode: string;

  @Prop({ required: true })
  reason: string;

  @Prop()
  notes?: string;

  @Prop({ required: true })
  bannedAt: Date;
}

@Schema()
export class User extends Document {
  @Prop({ required: true })
  fullname: string; // Add this

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string; // Add this

  @Prop({ required: true })
  phoneCode: string; // Add this

  @Prop({ required: true })
  gender: string; // Add this

  @Prop({ required: true })
  dob: string; // Add this (can also be Date type if preferred)

  @Prop({ required: true })
  password: string;

  @Prop({ type: [PasswordHistoryEntry], default: [] })
  passwordHistory: PasswordHistoryEntry[];

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: false })
  isBanned: boolean;

  @Prop({ type: BanInfo, default: null })
  banInfo?: BanInfo | null;

  @Prop()
  otp: string;

  @Prop()
  otpExpires: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
