// Example of what needs to be added to your User class/schema
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  otp: string;

  @Prop()
  otpExpires: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
