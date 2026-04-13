import { Injectable, ConflictException, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { sendEmail } from '../../../../../common/utils/sendEmail';
import { AdminRepository } from '../repositories/admin.repository';
import { AuthMessages } from '../../auth/enum/auth.enum';
import { Admin, AdminDocument } from '../schemas/admin.schema';
import { Role } from '../enum/role.enum';
import { LoginDto, ForgotPasswordDto, ResetPasswordDto } from '../dto/auth.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  // ✅ Create Admin (Used in Seeder + API)
  async createAdmin(data: {
    email: string;
    password: string;
    role?: Role;
  }): Promise<Admin> {
    const existing = await this.adminRepository.findByEmail(data.email);

    if (existing) {
      throw new ConflictException('Admin already exists with this email');
    }

    // Note: Password hashing is handled by AdminSchema pre-save hook.
    const admin = await this.adminRepository.create({
      email: data.email,
      password: data.password,
      role: data.role || Role.ADMIN,
      isActive: true,
    });

    return admin;
  }

  // ✅ Login Admin
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const admin = await this.adminRepository.findByEmail(email);

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const payload = {
      sub: admin._id,
      email: admin.email,
      role: admin.role
    };

    return {
      message: AuthMessages.LOGIN_SUCCESS,
      access_token: this.jwtService.sign(payload),
      role: admin.role,
      email: admin.email,
    };
  }

  // ✅ Find by Email (Login use case)
  async findByEmail(email: string): Promise<AdminDocument> {
    const admin = await this.adminRepository.findByEmail(email);

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return admin;
  }

  // ✅ Validate Password (Auth use case)
  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // ✅ Get Admin by ID
  async findById(adminId: string): Promise<AdminDocument> {
    const admin = await this.adminRepository.findById(adminId);

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return admin;
  }

  // ✅ Get All Admins (RBAC Protected)
  async getAllAdmins(): Promise<Admin[]> {
    return this.adminRepository.findAll();
  }

  // ✅ Update Role (SUPER_ADMIN only ideally)
  async updateRole(adminId: string, role: Role): Promise<Admin> {
    const admin = await this.adminRepository.findByIdAndUpdate(adminId, { role });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return admin;
  }

  // ✅ Activate / Deactivate Admin
  async toggleActive(adminId: string, isActive: boolean): Promise<Admin> {
    const admin = await this.adminRepository.findByIdAndUpdate(adminId, { isActive });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return admin;
  }

  // ✅ Forgot Password Logic
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const admin = await this.adminRepository.findByEmail(forgotPasswordDto.email);
    if (!admin) {
      // For security, don't reveal if user exists. Just return success.
      return { message: 'If this email exists, a reset link has been sent.' };
    }

    // Generate a short-lived token (15 mins).
    // Including the current password hash in the secret ensures the token invalidates automatically once the password is changed.
    const secret = this.configService.get<string>('JWT_SECRET') + admin.password;
    const resetToken = this.jwtService.sign(
      { sub: admin._id },
      { expiresIn: '15m', secret }
    );

    const baseUrl = this.configService.get<string>('ADMIN_FRONTEND_URL') || '';
    const resetLink = `${baseUrl}/resetPassword?token=${resetToken}`;

    sendEmail({
      to: admin.email,
      subject: 'Admin Password Reset Request',
      template: 'admin-password-reset',
      context: {
        link: resetLink,
      },
    }).catch(err => {
      console.error('Email failed:', err);
    });
    return { message: 'If this email exists, a reset link has been sent.' };
  }

  // ✅ Reset Password Logic
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    const decoded = this.jwtService.decode(token) as { sub: string };
    if (!decoded || !decoded.sub) throw new BadRequestException('Invalid reset token');

    const admin = await this.adminRepository.findById(decoded.sub);

    if (!admin) throw new NotFoundException('Admin not found');

    try {
      // Verify token using the user-specific secret used during generation
      const secret = this.configService.get<string>('JWT_SECRET') + admin.password;
      this.jwtService.verify(token, { secret });

      admin.password = newPassword; // Schema hook will re-hash this
      await this.adminRepository.save(admin);

      return { message: 'Password reset successful' };
    } catch (error) {
      throw new BadRequestException('Invalid or expired reset token');
    }
  }
}