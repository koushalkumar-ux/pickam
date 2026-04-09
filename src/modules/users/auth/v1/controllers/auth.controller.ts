import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ForgotPasswordDto } from '../dto/forgotPassword.dto';
import { ResetPasswordDto } from '../dto/resetPassword.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User } from '../../../../../common/decorators/user.decorator';
import { HttpCode, HttpStatus } from '@nestjs/common';
import { RateLimiterGuard } from '../../../../../common/guard/rate-limiter.guard';
import { RateLimit } from 'src/common/decorators/rate-limit.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@Controller({
  path: 'auth',
  version: '1',
})
@ApiTags('User Auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Get('test-connection')
  @HttpCode(HttpStatus.OK)
  testConnection() {
    return { status: 'success', message: 'API is reachable', timestamp: new Date().toISOString() };
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiBody({ type: RegisterDto })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('verifyOtp')
  @ApiOperation({ summary: 'Verify account registration OTP' })
  @ApiBody({ type: VerifyOtpDto })
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user and return JWT token' })
  @ApiBody({ type: LoginDto })
  @RateLimit({
    capacity: 10,
    refillRate: 1 / 60000, // 1 token per 60 seconds
  }) //After consuming tokens, the system should regain 1 token per 60 seconds
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('forgotPassword')
  @ApiOperation({ summary: 'Request password reset OTP' })
  @ApiBody({ type: ForgotPasswordDto })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('verifyResetOtp')
  @ApiOperation({ summary: 'Verify reset-password OTP and issue reset token' })
  @ApiBody({ type: VerifyOtpDto })
  verifyResetOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyResetOtp(dto);
  }

  @Post('resetPassword')
  @ApiOperation({ summary: 'Reset password with reset token' })
  @ApiBody({ type: ResetPasswordDto })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user payload' })
  getProfile(@User() user: any) {
    return user;
  }
}