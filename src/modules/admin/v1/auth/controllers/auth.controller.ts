import { Controller, Post, Get, Body, Query, Render, HttpCode, HttpStatus } from '@nestjs/common';
import { AdminService } from '../service/admin.service';
import { LoginDto, ForgotPasswordDto, ResetPasswordDto } from '../dto/auth.dto';

@Controller({
  path: 'admin/auth',
  version: '1',
})
export class AdminAuthController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.adminService.login(loginDto);
  }

  @Get('resetPassword')
  @Render('admin-reset-password-form')
  async showResetForm(@Query('token') token: string) {
    return { token };
  }

  @Post('forgotPassword')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.adminService.forgotPassword(forgotPasswordDto);
  }

  @Post('resetPassword')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.adminService.resetPassword(resetPasswordDto);
  }
}