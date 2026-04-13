// Example of what needs to be added to your User class/schema
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  fullname!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  phone!: string;

  @Prop({ required: true })
  phoneCode!: string;

  @Prop({ required: true })
  gender!: string;

  @Prop({ required: true })
  dob!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ required: true, enum: ['staff_account', 'buyer_account', 'shopmate_account'] })
  role!: string;

  @Prop({ default: null })
  profilePic!: string;

  @Prop({ default: false })
  isVerified!: boolean;

  @Prop()
  otp!: string;

  @Prop()
  otpExpires!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

@Schema({ timestamps: true })
export class StaffProfile extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId!: string;
}
export const StaffProfileSchema = SchemaFactory.createForClass(StaffProfile);

@Schema({ timestamps: true })
export class BuyerProfile extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId!: string;
}
export const BuyerProfileSchema = SchemaFactory.createForClass(BuyerProfile);

@Schema({ timestamps: true })
export class ShopmateProfile extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId!: string;
}
export const ShopmateProfileSchema = SchemaFactory.createForClass(ShopmateProfile);
