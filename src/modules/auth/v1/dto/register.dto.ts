import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,Equals
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  phoneCode: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsDateString()
  @IsNotEmpty()
  dob: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @IsBoolean()
  isVerified: boolean = false;

  @IsBoolean()
  @Equals(true, { message: 'You must accept terms and conditions' })
  termsAndConditions: boolean;
}