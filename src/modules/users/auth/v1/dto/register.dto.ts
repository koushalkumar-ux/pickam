import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Equals,
  IsIn
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  fullname!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  phoneCode!: string;

  @IsString()
  @IsNotEmpty()
  gender!: string;

  @IsDateString()
  @IsNotEmpty()
  dob!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsIn(['staff_account', 'buyer_account', 'shopmate_account'])
  role!: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword!: string;

  @IsBoolean()
  isVerified: boolean = false;

  @IsBoolean()
  @Equals(true, { message: 'You must accept terms and conditions' })
  termsAndConditions!: boolean;
}