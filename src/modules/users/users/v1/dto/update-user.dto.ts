import { IsDateString, IsEmail, IsOptional, IsString, Length, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  fullname?: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'email must be a valid email address' })
  email?: string;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsOptional()
  @IsString()
  @Length(8, 15, { message: 'phone must be between 8 and 15 characters' })
  phone?: string;

  @ApiPropertyOptional({ example: '+01' })
  @IsOptional()
  @IsString()
  phoneCode?: string;

  @ApiPropertyOptional({ example: 'Female' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: '2000-01-01' })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiPropertyOptional({ example: 'NewStrongPass123' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
