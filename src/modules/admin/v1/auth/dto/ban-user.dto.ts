import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class BanUserDto {
  @ApiProperty({ example: 'policy_violation' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  reasonCode: string;

  @ApiProperty({ example: 'User repeatedly violated platform policy.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  reason: string;

  @ApiPropertyOptional({ example: 'Evidence: ticket #2381, screenshots reviewed by moderator.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

