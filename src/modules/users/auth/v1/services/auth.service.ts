import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../../users/v1/repositories/user.repository';
import { RegisterDto } from '../dto/register.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { LoginDto } from '../dto/login.dto';
import { ForgotPasswordDto } from '../dto/forgotPassword.dto';
import { ResetPasswordDto } from '../dto/resetPassword.dto';
import { AuthMessages } from '../enum/auth-messages.enum';
import { sendEmail } from '../../../../../common/utils/sendEmail';
import { DbLoggerService } from '../../../../logger/services/db-logger.service';
import { RateLimit } from '../../../../../common/decorators/rate-limit.decorator';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userRepository: UserRepository,
    private logger: DbLoggerService,
  ) {
    this.logger.setModule('AuthModule');
  }

  async register(dto: RegisterDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException(AuthMessages.PASSWORDS_DO_NOT_MATCH);
    }

    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException(AuthMessages.USER_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    const user = await this.userRepository.create({
      fullname: dto.fullname,
      phone: dto.phone,
      phoneCode: dto.phoneCode,
      gender: dto.gender,
      dob: dto.dob,
      email: dto.email,
      password: hashedPassword,
      otp,
      otpExpires,
      isVerified: false,
    });

    this.sendOtpEmail(user.email, otp).catch(err => {
      this.logger.error('Registration OTP Email failed', err.stack, 'AuthService.register');
    });

    return {
      message: AuthMessages.REGISTER_SUCCESS,
      email: user.email,
    };
  }

  private async sendOtpEmail(email: string, otp: string) {
    return await sendEmail({
      to: email,
      subject: 'Verify Your Account - PickAm',
      template: 'otp',
      context: { otp },
    });
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new BadRequestException(AuthMessages.USER_NOT_FOUND);
    }

    if (user.otp !== dto.otp) {
      throw new BadRequestException(AuthMessages.OTP_INVALID);
    }

    if (user.otpExpires && new Date() > user.otpExpires) {
      throw new BadRequestException(AuthMessages.OTP_EXPIRED);
    }

    await this.userRepository.update(user._id.toString(), {
      isVerified: true,
      otp: null,
      otpExpires: null,
    });

    return {
      message: AuthMessages.VERIFY_SUCCESS,
      ...this.generateToken(user),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException(AuthMessages.INVALID_CREDENTIALS);
    }

    if (!user.isVerified) {
      throw new BadRequestException(AuthMessages.ACCOUNT_NOT_VERIFIED);
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException(AuthMessages.INVALID_CREDENTIALS);
    }
    return {
      message: AuthMessages.LOGIN_SUCCESS,
      ...this.generateToken(user),
    };
  }

  generateToken(user: any) {
    const payload = { sub: user._id || user.id, email: user.email };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  @RateLimit({ capacity: 3, refillRate: 1 / (60 * 1000) }) // 3 requests per minute
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepository.findByEmail(dto.email);

    // ✅ Prevent enumeration
    if (!user) {
      return {
        message: AuthMessages.FORGOT_PASSWORD_SUCCESS,
      };
    }

    // ✅ Prevent spam
    if (user.otpExpires && user.otpExpires > new Date()) {
      throw new BadRequestException('OTP already sent. Try again later.');
    }

    // ✅ Secure OTP
    const { randomInt } = await import('crypto');
    const otp = randomInt(100000, 999999).toString();

    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await this.userRepository.update(user._id.toString(), {
      otp,
      otpExpires,
    });

    // ✅ Non-blocking email
    this.sendOtpEmail(user.email, otp).catch(err => {
      this.logger.error('Forgot Password OTP Email failed', err.stack, 'AuthService.forgotPassword');
    });

    return {
      message: AuthMessages.FORGOT_PASSWORD_SUCCESS,
      email: user.email,
    };
  }

  async verifyResetOtp(dto: VerifyOtpDto) {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new BadRequestException(AuthMessages.USER_NOT_FOUND);
    }

    if (user.otp !== dto.otp) {
      throw new BadRequestException(AuthMessages.OTP_INVALID);
    }

    if (user.otpExpires && new Date() > user.otpExpires) {
      throw new BadRequestException(AuthMessages.OTP_EXPIRED);
    }

    // Clear the OTP so it cannot be used again
    await this.userRepository.update(user._id.toString(), {
      otp: null,
      otpExpires: null,
    });

    // Generate a short-lived reset token (expires in 15 minutes)
    const resetToken = this.jwtService.sign(
      { sub: user._id.toString(), email: user.email, action: 'password_reset' },
      { expiresIn: '15m' },
    );

    return {
      message: 'OTP verified successfully.',
      email: user.email,
      resetToken,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException(AuthMessages.PASSWORDS_DO_NOT_MATCH);
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(dto.resetToken);
      if (payload.action !== 'password_reset') {
        throw new Error();
      }
    } catch (error) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = await this.userRepository.findByEmail(payload.email);
    if (!user) {
      throw new BadRequestException(AuthMessages.USER_NOT_FOUND);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await this.userRepository.update(user._id.toString(), {
      password: hashedPassword,
    });

    return {
      message: 'Password reset successful. Please login with your new password.',
    };
  }
}