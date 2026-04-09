import { Controller, Post, Get, Body, Query, Render, HttpCode, HttpStatus } from '@nestjs/common';
import { AdminService } from '../service/admin.service';
import { LoginDto, ForgotPasswordDto, ResetPasswordDto } from '../dto/auth.dto';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@Controller({
  path: 'admin/auth',
  version: '1',
})
@ApiTags('Admin Auth')
export class AdminAuthController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    return this.adminService.login(loginDto);
  }

  @Get('resetPassword')
  @Render('admin-reset-password-form')
  @ApiOperation({ summary: 'Render admin reset password form' })
  @ApiQuery({ name: 'token', required: true, type: String })
  async showResetForm(@Query('token') token: string) {
    return { token };
  }

  @Post('forgotPassword')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin forgot password' })
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.adminService.forgotPassword(forgotPasswordDto);
  }

  @Post('resetPassword')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin reset password' })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.adminService.resetPassword(resetPasswordDto);
  }
}